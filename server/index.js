import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Database } from './db.js';
import { generateToken, authenticate, requireAuth, requireAdmin } from './auth.js';
import { sendOtpEmail } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = Boolean(process.env.VERCEL);
const UPLOADS_DIR = IS_VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[SERVER] Uploads dir notice:', err.message);
}

// Multer storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'mat-' + uniqueSuffix + ext);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Normalize route paths in serverless environment
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    req.url = '/api' + req.url;
  }
  next();
});

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(authenticate);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Request OTP for institutional email
app.post('/api/auth/request-otp', async (req, res) => {
  const { email, name } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "Please provide a valid institutional email address or Roll Number." });
  }

  let cleanInput = email.trim().toLowerCase();
  const config = Database.getConfig();

  // If user entered a Roll Number (e.g., AP26110090265), auto-map to their official email
  let matchedStudent = null;
  if (!cleanInput.includes('@')) {
    matchedStudent = Database.getStudentByRoll(cleanInput);
    if (matchedStudent) {
      cleanInput = matchedStudent.email.toLowerCase();
    } else {
      return res.status(400).json({ 
        error: `No registered student found with Roll Number ${cleanInput.toUpperCase()}. Please check or enter your @srmap.edu.in email.` 
      });
    }
  } else {
    matchedStudent = Database.getStudentByEmail(cleanInput);
  }

  const cleanEmail = cleanInput;
  const isAdmin = cleanEmail === config.adminEmail.toLowerCase() || 
                  cleanEmail === 'avigayan_jana@srmap.edu.in' ||
                  matchedStudent?.role === 'CR';

  // Institutional domain check
  if (!cleanEmail.endsWith('@srmap.edu.in') && !isAdmin) {
    return res.status(400).json({ 
      error: "Access is strictly restricted to SRM University AP institutional emails ending with @srmap.edu.in" 
    });
  }

  // Determine student name
  const studentName = matchedStudent?.name || (isAdmin ? (config.adminName || "CYBEX D - Class Representative") : name);

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  Database.saveOtp(cleanEmail, otp);

  console.log(`[AUTH] Generated OTP for ${cleanEmail} (${studentName || 'Student'}): ${otp}`);

  // Dispatch real email via SMTP if configured
  const emailDispatchResult = await sendOtpEmail(cleanEmail, otp, studentName);

  return res.json({
    success: true,
    message: emailDispatchResult.sent 
      ? `Verification code dispatched to ${cleanEmail}. Please check your institutional inbox.` 
      : `Verification code generated for ${cleanEmail}.`,
    emailSent: emailDispatchResult.sent,
    previewOtp: emailDispatchResult.sent ? undefined : otp,
    email: cleanEmail,
    detectedName: studentName,
    rollNumber: matchedStudent?.rollNumber,
    role: isAdmin ? 'admin' : 'student'
  });
});

// Verify OTP & generate login session
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp, name } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email/Roll Number and OTP verification code are required." });
  }

  let cleanInput = email.trim().toLowerCase();
  let matchedStudent = null;

  if (!cleanInput.includes('@')) {
    matchedStudent = Database.getStudentByRoll(cleanInput);
    if (matchedStudent) {
      cleanInput = matchedStudent.email.toLowerCase();
    }
  } else {
    matchedStudent = Database.getStudentByEmail(cleanInput);
  }

  const cleanEmail = cleanInput;
  const rawInput = email.trim().toLowerCase();

  // Check validity against either cleanEmail or rawInput (roll number)
  const isValid = Database.verifyOtp(cleanEmail, otp.trim()) || Database.verifyOtp(rawInput, otp.trim());

  if (!isValid) {
    return res.status(400).json({ error: "Invalid or expired verification code. Please check your latest email or request a new OTP." });
  }

  const config = Database.getConfig();
  const isAdmin = cleanEmail === config.adminEmail.toLowerCase() || 
                  cleanEmail === 'avigayan_jana@srmap.edu.in' || 
                  matchedStudent?.role === 'CR';
  
  // Format student name
  let formattedName = matchedStudent?.name || name;
  if (!formattedName || formattedName.trim() === '') {
    if (isAdmin) {
      formattedName = config.adminName || "CYBEX D - Class Representative";
    } else {
      const prefix = cleanEmail.split('@')[0];
      formattedName = prefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
  }

  const user = Database.upsertUser({
    email: cleanEmail,
    name: formattedName,
    rollNumber: matchedStudent?.rollNumber || '',
    section: matchedStudent?.section || 'D',
    batch: matchedStudent?.batch || '2024-2028',
    role: isAdmin ? 'admin' : 'student'
  });

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user
  });
});

// Get current user session
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  const fullUser = Database.getUserByEmail(req.user.email);
  res.json({ user: fullUser || req.user });
});

// Quick Dev switch role (helps test student vs CR easily)
app.post('/api/auth/switch-role', requireAuth, (req, res) => {
  const { targetRole } = req.body;
  const config = Database.getConfig();
  let email = req.user.email;
  let name = req.user.name;

  if (targetRole === 'admin') {
    email = config.adminEmail;
    name = config.adminName || "Class Representative";
  } else {
    if (email === config.adminEmail) {
      email = "student.demo@srmap.edu.in";
      name = "Demo Student (CSE-D)";
    }
  }

  const user = Database.upsertUser({
    email,
    name,
    role: targetRole === 'admin' ? 'admin' : 'student'
  });

  const token = generateToken(user);
  res.json({ success: true, token, user });
});

// ==========================================
// CONFIGURATION ROUTES
// ==========================================

app.get('/api/config', (req, res) => {
  const config = Database.getConfig();
  // Provide safe public config
  res.json({
    sectionName: config.sectionName,
    batchYear: config.batchYear,
    academicYear: config.academicYear,
    adminEmail: config.adminEmail,
    adminName: config.adminName
  });
});

app.put('/api/config', requireAdmin, (req, res) => {
  const updates = req.body;
  const updated = Database.updateConfig(updates);
  res.json({ success: true, config: updated });
});

// ==========================================
// ANNOUNCEMENTS ROUTES
// ==========================================

app.get('/api/announcements', (req, res) => {
  res.json(Database.getAnnouncements());
});

app.post('/api/announcements', requireAdmin, (req, res) => {
  const { title, content, category, priority, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  const item = Database.createAnnouncement({
    title,
    content,
    category: category || 'General',
    priority: priority || 'Normal',
    isPinned: Boolean(isPinned),
    authorName: req.user.name || "Class Representative"
  });
  res.status(201).json(item);
});

app.put('/api/announcements/:id', requireAdmin, (req, res) => {
  const updated = Database.updateAnnouncement(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Announcement not found" });
  res.json(updated);
});

app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteAnnouncement(req.params.id);
  if (!ok) return res.status(404).json({ error: "Announcement not found" });
  res.json({ success: true });
});

// ==========================================
// TIMETABLE ROUTES
// ==========================================

app.get('/api/timetable', (req, res) => {
  res.json(Database.getTimetable());
});

app.post('/api/timetable', requireAdmin, (req, res) => {
  const { day, startTime, endTime, subject, subjectCode, faculty, room, type } = req.body;
  if (!day || !startTime || !endTime || !subject) {
    return res.status(400).json({ error: "Day, start time, end time, and subject are required." });
  }
  const item = Database.createTimetableSlot({
    day,
    startTime,
    endTime,
    subject,
    subjectCode: subjectCode || "",
    faculty: faculty || "TBD",
    room: room || "ALH 302",
    type: type || "Lecture"
  });
  res.status(201).json(item);
});

app.put('/api/timetable/:id', requireAdmin, (req, res) => {
  const updated = Database.updateTimetableSlot(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Timetable slot not found" });
  res.json(updated);
});

app.delete('/api/timetable/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteTimetableSlot(req.params.id);
  if (!ok) return res.status(404).json({ error: "Timetable slot not found" });
  res.json({ success: true });
});

// ==========================================
// STUDY MATERIALS ROUTES
// ==========================================

app.get('/api/materials', (req, res) => {
  const { subject } = req.query;
  res.json(Database.getMaterials(subject));
});

app.post('/api/materials', requireAdmin, upload.single('file'), (req, res) => {
  const { title, subject, subjectCode, faculty, type, description, linkUrl } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: "Title and subject are required." });
  }

  let fileName = "";
  let fileSize = "";
  let downloadUrl = linkUrl || "";

  if (req.file) {
    fileName = req.file.originalname;
    fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";
    downloadUrl = `/uploads/${req.file.filename}`;
  }

  const item = Database.createMaterial({
    title,
    subject,
    subjectCode: subjectCode || "",
    faculty: faculty || "",
    type: type || "Notes",
    description: description || "",
    linkUrl: downloadUrl,
    fileName,
    fileSize,
    uploadedBy: req.user.email
  });
  res.status(201).json(item);
});

app.put('/api/materials/:id', requireAdmin, (req, res) => {
  const updated = Database.updateMaterial(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Material not found" });
  res.json(updated);
});

app.delete('/api/materials/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteMaterial(req.params.id);
  if (!ok) return res.status(404).json({ error: "Material not found" });
  res.json({ success: true });
});

// ==========================================
// FEEDBACK & PROBLEMS ROUTES
// ==========================================

// Students see their own; Admin sees all
app.get('/api/feedback', requireAuth, (req, res) => {
  const list = Database.getFeedback(req.user);
  res.json(list);
});

app.post('/api/feedback', requireAuth, (req, res) => {
  const { category, subject, facultyName, title, description, isAnonymous } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, category, and description are required." });
  }

  const item = Database.createFeedback({
    studentEmail: req.user.email,
    studentName: req.user.name || "Student",
    isAnonymous: Boolean(isAnonymous),
    category,
    subject: subject || "General",
    facultyName: facultyName || "",
    title,
    description
  });
  res.status(201).json(item);
});

app.patch('/api/feedback/:id/status', requireAdmin, (req, res) => {
  const { status, crResponse } = req.body;
  const updated = Database.updateFeedbackStatus(req.params.id, { status, crResponse });
  if (!updated) return res.status(404).json({ error: "Feedback not found" });
  res.json(updated);
});

app.delete('/api/feedback/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteFeedback(req.params.id);
  if (!ok) return res.status(404).json({ error: "Feedback not found" });
  res.json({ success: true });
});

// ==========================================
// LIVE MANDATORY CLASS SURVEY ROUTES
// ==========================================

// Get survey completion stats
app.get('/api/surveys/stats', (req, res) => {
  const stats = Database.getSurveyStats();
  res.json(stats);
});

// Get all survey records (CR Admin only)
app.get('/api/surveys', requireAdmin, (req, res) => {
  res.json(Database.getSurveys());
});

// Check if current logged-in user submitted the survey
app.get('/api/surveys/my-status', requireAuth, (req, res) => {
  const submitted = Database.hasSubmittedSurvey(req.user.email);
  res.json({ submitted, email: req.user.email });
});

// Submit mandatory term survey
app.post('/api/surveys', requireAuth, (req, res) => {
  const { facultyReviews, classInfrastructureRating, overallFeedback, recommendations } = req.body;
  
  const matchedStudent = Database.getStudentByEmail(req.user.email);

  const survey = Database.submitSurvey({
    studentEmail: req.user.email,
    studentName: req.user.name,
    studentRoll: matchedStudent?.rollNumber || req.user.rollNumber || 'Enrolled Student',
    facultyReviews: facultyReviews || [],
    classInfrastructureRating: classInfrastructureRating || 5,
    overallFeedback: overallFeedback || '',
    recommendations: recommendations || ''
  });

  res.status(201).json({ success: true, survey });
});

// ==========================================
// DOUBT BOARD ROUTES
// ==========================================

app.get('/api/doubts', (req, res) => {
  const doubts = Database.getDoubts();
  res.json(doubts);
});

app.get('/api/doubts/:id', (req, res) => {
  const doubt = Database.getDoubtById(req.params.id);
  if (!doubt) return res.status(404).json({ error: "Doubt not found" });
  res.json(doubt);
});

app.post('/api/doubts', requireAuth, (req, res) => {
  const { title, subject, subjectCode, description } = req.body;
  if (!title || !subject || !description) {
    return res.status(400).json({ error: "Title, subject, and description are required." });
  }

  const item = Database.createDoubt({
    studentEmail: req.user.email,
    studentName: req.user.name || "Student",
    title,
    subject,
    subjectCode: subjectCode || "",
    description
  });
  res.status(201).json(item);
});

app.post('/api/doubts/:id/replies', requireAuth, (req, res) => {
  const { message } = req.body;
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: "Reply message cannot be empty." });
  }

  const isCR = req.user.role === 'admin';
  const updated = Database.addDoubtReply(req.params.id, {
    authorEmail: req.user.email,
    authorName: isCR ? "Class Representative" : req.user.name,
    isCR,
    message: message.trim()
  });

  if (!updated) return res.status(404).json({ error: "Doubt not found" });
  res.status(201).json(updated);
});

app.patch('/api/doubts/:id/resolve', requireAuth, (req, res) => {
  const { isResolved } = req.body;
  const doubt = Database.getDoubtById(req.params.id);
  if (!doubt) return res.status(404).json({ error: "Doubt not found" });

  // Only the student author or CR/Admin can toggle resolution
  const isAuthor = doubt.studentEmail.toLowerCase() === req.user.email.toLowerCase();
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ error: "Only the student who asked this doubt or the CR can mark it as resolved." });
  }

  const updated = Database.toggleDoubtResolved(req.params.id, Boolean(isResolved));
  res.json(updated);
});

app.delete('/api/doubts/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteDoubt(req.params.id);
  if (!ok) return res.status(404).json({ error: "Doubt not found" });
  res.json({ success: true });
});

// ==========================================
// STUDENT DIRECTORY & DATABASE ROUTES
// ==========================================

// Get all enrolled students
app.get('/api/students', (req, res) => {
  const students = Database.getStudents();
  res.json(students);
});

// Lookup student by roll number or email
app.get('/api/students/lookup', (req, res) => {
  const { roll, email } = req.query;
  if (roll) {
    const student = Database.getStudentByRoll(roll);
    if (!student) return res.status(404).json({ error: "Student not found with this Roll Number" });
    return res.json(student);
  }
  if (email) {
    const student = Database.getStudentByEmail(email);
    if (!student) return res.status(404).json({ error: "Student not found with this Email" });
    return res.json(student);
  }
  res.status(400).json({ error: "Please provide either ?roll= or ?email= query parameter" });
});

// Add new student (Admin only)
app.post('/api/students', requireAdmin, (req, res) => {
  const { rollNumber, name, email, section, batch, role } = req.body;
  if (!rollNumber || !name || !email) {
    return res.status(400).json({ error: "Roll Number, Name, and Email are required." });
  }

  const existingRoll = Database.getStudentByRoll(rollNumber);
  if (existingRoll) {
    return res.status(400).json({ error: `Student with roll number ${rollNumber} already exists.` });
  }

  const existingEmail = Database.getStudentByEmail(email);
  if (existingEmail) {
    return res.status(400).json({ error: `Student with email ${email} already exists.` });
  }

  const student = Database.addStudent({
    rollNumber,
    name,
    email,
    section: section || 'D',
    batch: batch || '2024-2028',
    role: role || 'Student'
  });

  res.status(201).json(student);
});

// Update student details (Admin only)
app.put('/api/students/:id', requireAdmin, (req, res) => {
  const updated = Database.updateStudent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Student not found" });
  res.json(updated);
});

// Delete student (Admin only)
app.delete('/api/students/:id', requireAdmin, (req, res) => {
  const ok = Database.deleteStudent(req.params.id);
  if (!ok) return res.status(404).json({ error: "Student not found" });
  res.json({ success: true, message: "Student removed from directory." });
});

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json(Database.getStats());
});

// Serve frontend in production if built (for standalone node server)
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR) && process.env.VERCEL !== '1') {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` SRM AP CSE Section D CR Portal Backend Server Running`);
    console.log(` API Endpoint: http://localhost:${PORT}`);
    console.log(` Initial Admin Email: ${Database.getConfig().adminEmail}`);
    console.log(`====================================================`);
  });
}

export default app;
