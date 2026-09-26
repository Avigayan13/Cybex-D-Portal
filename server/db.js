import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initialConfig, 
  initialAnnouncements, 
  initialTimetable, 
  initialMaterials, 
  initialFeedback, 
  initialDoubts,
  initialStudents 
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp/data' : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[DB] Filesystem note:', err.message);
}

let db = {
  config: { ...initialConfig },
  announcements: [...initialAnnouncements],
  timetable: [...initialTimetable],
  materials: [...initialMaterials],
  feedback: [...initialFeedback],
  doubts: [...initialDoubts],
  students: [...initialStudents],
  surveys: [],
  otps: [],
  users: [
    {
      email: initialConfig.adminEmail,
      name: "CYBEX D - Class Representative",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ]
};

// Load existing database if available
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        ...db,
        ...parsed,
        surveys: parsed.surveys || [],
        students: (parsed.students && parsed.students.length > 0) ? parsed.students : [...initialStudents]
      };

      // Ensure Avigayan Jana (CR) is synchronized
      const aviIdx = db.students.findIndex(s => s.email === 'avigayan_jana@srmap.edu.in');
      if (aviIdx >= 0) {
        db.students[aviIdx] = {
          ...db.students[aviIdx],
          rollNumber: "AP26110090265",
          name: "AVIGAYAN JANA",
          email: "avigayan_jana@srmap.edu.in",
          section: "D",
          batch: "2024-2028",
          role: "CR"
        };
      }

      // Ensure Rajdeep Paudel is synchronized
      const rajdeepIdx = db.students.findIndex(s => s.email === 'rajdeep_paudel@srmap.edu.in' || s.rollNumber === 'AP26110090269');
      if (rajdeepIdx >= 0) {
        db.students[rajdeepIdx] = {
          ...db.students[rajdeepIdx],
          rollNumber: "AP26110090269",
          name: "RAJDEEP PAUDEL",
          email: "rajdeep_paudel@srmap.edu.in",
          section: "D",
          batch: "2024-2028",
          role: "Student"
        };
      } else {
        db.students.push({
          id: db.students.length + 1,
          rollNumber: "AP26110090269",
          name: "RAJDEEP PAUDEL",
          email: "rajdeep_paudel@srmap.edu.in",
          section: "D",
          batch: "2024-2028",
          role: "Student"
        });
      }

      // Ensure user account is registered with correct roll
      const rajdeepUser = db.users.find(u => u.email === 'rajdeep_paudel@srmap.edu.in');
      if (rajdeepUser) {
        rajdeepUser.rollNumber = "AP26110090269";
        rajdeepUser.name = "RAJDEEP PAUDEL";
      } else {
        db.users.push({
          email: "rajdeep_paudel@srmap.edu.in",
          name: "RAJDEEP PAUDEL",
          rollNumber: "AP26110090269",
          section: "D",
          batch: "2024-2028",
          role: "student",
          createdAt: new Date().toISOString()
        });
      }

      const aviUser = db.users.find(u => u.email === 'avigayan_jana@srmap.edu.in');
      if (aviUser) {
        aviUser.rollNumber = "AP26110090265";
      }

      saveDB();
      console.log(`Database loaded successfully from file (${db.students.length} students enrolled).`);
    } else {
      saveDB();
      console.log('New database initialized with CSE Section D seed data.');
    }
  } catch (err) {
    console.error('Error loading database, resetting to default seeds:', err);
    saveDB();
  }
}

// Atomic save helper
function saveDB() {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

loadDB();

export const Database = {
  // Config
  getConfig() {
    return db.config;
  },
  updateConfig(updates) {
    db.config = { ...db.config, ...updates, updatedAt: new Date().toISOString() };
    saveDB();
    return db.config;
  },

  // Users
  getUserByEmail(email) {
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  upsertUser(userData) {
    const existingIndex = db.users.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...userData };
    } else {
      db.users.push({
        ...userData,
        createdAt: new Date().toISOString()
      });
    }
    saveDB();
    return this.getUserByEmail(userData.email);
  },

  // OTPs
  saveOtp(email, code) {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const cleanEmail = email.trim().toLowerCase();
    const matched = this.getStudentByEmail(cleanEmail);
    const cleanRoll = matched?.rollNumber?.toLowerCase();

    // Clean up older OTPs for this email or roll
    db.otps = (db.otps || []).filter(o => 
      o.email !== cleanEmail && 
      (!cleanRoll || o.roll !== cleanRoll) &&
      o.email !== cleanRoll
    );

    db.otps.push({ 
      email: cleanEmail, 
      roll: cleanRoll || '', 
      code: code.toString().trim(), 
      expiresAt 
    });
    saveDB();
  },
  verifyOtp(input, code) {
    if (!input || !code) return false;
    const cleanInput = input.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Check if input matches email or roll
    const entry = (db.otps || []).find(o => 
      (o.email === cleanInput || o.roll === cleanInput || o.email.split('@')[0] === cleanInput) && 
      o.code === cleanCode
    );

    if (!entry) {
      console.log(`[AUTH DEBUG] Verification failed for input="${cleanInput}", code="${cleanCode}". Active OTPs:`, db.otps);
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      console.log(`[AUTH DEBUG] OTP expired for input="${cleanInput}".`);
      return false;
    }

    // Clean up used OTP
    db.otps = db.otps.filter(o => o !== entry);
    saveDB();
    return true;
  },
  getRecentOtp(email) {
    const clean = email.trim().toLowerCase();
    return (db.otps || []).find(o => (o.email === clean || o.roll === clean) && Date.now() <= o.expiresAt);
  },

  // Announcements
  getAnnouncements() {
    return [...db.announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },
  createAnnouncement(ann) {
    const item = {
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPinned: false,
      priority: 'Normal',
      category: 'General',
      ...ann
    };
    db.announcements.unshift(item);
    saveDB();
    return item;
  },
  updateAnnouncement(id, updates) {
    const idx = db.announcements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    db.announcements[idx] = { ...db.announcements[idx], ...updates };
    saveDB();
    return db.announcements[idx];
  },
  deleteAnnouncement(id) {
    const before = db.announcements.length;
    db.announcements = db.announcements.filter(a => a.id !== id);
    saveDB();
    return db.announcements.length < before;
  },

  // Timetable
  getTimetable() {
    return db.timetable;
  },
  createTimetableSlot(slot) {
    const item = {
      id: `tt-${Date.now()}`,
      ...slot
    };
    db.timetable.push(item);
    saveDB();
    return item;
  },
  updateTimetableSlot(id, updates) {
    const idx = db.timetable.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.timetable[idx] = { ...db.timetable[idx], ...updates };
    saveDB();
    return db.timetable[idx];
  },
  deleteTimetableSlot(id) {
    const before = db.timetable.length;
    db.timetable = db.timetable.filter(t => t.id !== id);
    saveDB();
    return db.timetable.length < before;
  },

  // Materials
  getMaterials(subject) {
    let list = [...db.materials];
    if (subject && subject !== 'All') {
      list = list.filter(m => m.subject.toLowerCase() === subject.toLowerCase() || m.subjectCode?.toLowerCase() === subject.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createMaterial(mat) {
    const item = {
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: 'Notes',
      ...mat
    };
    db.materials.unshift(item);
    saveDB();
    return item;
  },
  updateMaterial(id, updates) {
    const idx = db.materials.findIndex(m => m.id === id);
    if (idx === -1) return null;
    db.materials[idx] = { ...db.materials[idx], ...updates };
    saveDB();
    return db.materials[idx];
  },
  deleteMaterial(id) {
    const before = db.materials.length;
    db.materials = db.materials.filter(m => m.id !== id);
    saveDB();
    return db.materials.length < before;
  },

  // Feedback
  getFeedback(user) {
    // If admin, return all; if student, return only their own
    if (user.role === 'admin') {
      return [...db.feedback].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return db.feedback
      .filter(f => f.studentEmail.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createFeedback(feedbackData) {
    const item = {
      id: `fb-${Date.now()}`,
      status: 'New',
      crResponse: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...feedbackData
    };
    db.feedback.unshift(item);
    saveDB();
    return item;
  },
  updateFeedbackStatus(id, { status, crResponse }) {
    const idx = db.feedback.findIndex(f => f.id === id);
    if (idx === -1) return null;
    if (status) db.feedback[idx].status = status;
    if (crResponse !== undefined) db.feedback[idx].crResponse = crResponse;
    db.feedback[idx].updatedAt = new Date().toISOString();
    saveDB();
    return db.feedback[idx];
  },
  deleteFeedback(id) {
    const before = db.feedback.length;
    db.feedback = db.feedback.filter(f => f.id !== id);
    saveDB();
    return db.feedback.length < before;
  },

  // Doubts
  getDoubts() {
    // Return all doubts for doubt board, but anonymize/sanitize student details for peer privacy if desired
    return [...db.doubts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getDoubtById(id) {
    return db.doubts.find(d => d.id === id);
  },
  createDoubt(doubtData) {
    const item = {
      id: `dbt-${Date.now()}`,
      status: 'Open',
      isResolved: false,
      replies: [],
      createdAt: new Date().toISOString(),
      ...doubtData
    };
    db.doubts.unshift(item);
    saveDB();
    return item;
  },
  addDoubtReply(doubtId, replyData) {
    const idx = db.doubts.findIndex(d => d.id === doubtId);
    if (idx === -1) return null;
    const reply = {
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...replyData
    };
    db.doubts[idx].replies.push(reply);
    if (db.doubts[idx].status === 'Open') {
      db.doubts[idx].status = 'Answered';
    }
    saveDB();
    return db.doubts[idx];
  },
  toggleDoubtResolved(doubtId, isResolved) {
    const idx = db.doubts.findIndex(d => d.id === doubtId);
    if (idx === -1) return null;
    db.doubts[idx].isResolved = isResolved;
    db.doubts[idx].status = isResolved ? 'Resolved' : (db.doubts[idx].replies.length > 0 ? 'Answered' : 'Open');
    saveDB();
    return db.doubts[idx];
  },
  deleteDoubt(id) {
    const before = db.doubts.length;
    db.doubts = db.doubts.filter(d => d.id !== id);
    saveDB();
    return db.doubts.length < before;
  },

  // Students Directory
  getStudents() {
    return [...(db.students || [])];
  },
  getStudentByRoll(rollNumber) {
    if (!rollNumber) return null;
    return (db.students || []).find(s => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase());
  },
  getStudentByEmail(email) {
    if (!email) return null;
    return (db.students || []).find(s => s.email.toLowerCase() === email.trim().toLowerCase());
  },
  addStudent(studentData) {
    const newStudent = {
      id: (db.students?.length || 0) + 1,
      rollNumber: studentData.rollNumber.trim().toUpperCase(),
      name: studentData.name.trim().toUpperCase(),
      email: studentData.email.trim().toLowerCase(),
      section: studentData.section || 'D',
      batch: studentData.batch || '2024-2028',
      role: studentData.role || 'Student',
      createdAt: new Date().toISOString()
    };
    if (!db.students) db.students = [];
    db.students.push(newStudent);
    saveDB();
    return newStudent;
  },
  updateStudent(id, updates) {
    if (!db.students) return null;
    const idx = db.students.findIndex(s => s.id === Number(id) || s.id === id);
    if (idx === -1) return null;
    db.students[idx] = { 
      ...db.students[idx], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.students[idx];
  },
  deleteStudent(id) {
    if (!db.students) return false;
    const before = db.students.length;
    db.students = db.students.filter(s => s.id !== Number(id) && s.id !== id);
    saveDB();
    return db.students.length < before;
  },

  // Live Class Mandatory Survey
  getSurveys() {
    return [...(db.surveys || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  hasSubmittedSurvey(email) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return (db.surveys || []).some(s => s.studentEmail.toLowerCase() === clean);
  },
  submitSurvey(surveyData) {
    const cleanEmail = surveyData.studentEmail.trim().toLowerCase();
    // Remove previous submission if re-submitting / updating
    db.surveys = (db.surveys || []).filter(s => s.studentEmail.toLowerCase() !== cleanEmail);
    const item = {
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...surveyData,
      studentEmail: cleanEmail
    };
    db.surveys.unshift(item);
    saveDB();
    return item;
  },
  getSurveyStats() {
    const totalEnrolled = (db.students || []).length || 58;
    const submittedCount = (db.surveys || []).length;
    const percentage = Math.round((submittedCount / totalEnrolled) * 100);
    const submittedEmails = new Set((db.surveys || []).map(s => s.studentEmail.toLowerCase()));
    
    const pendingStudents = (db.students || []).filter(s => !submittedEmails.has(s.email.toLowerCase()));
    const completedStudents = (db.students || []).filter(s => submittedEmails.has(s.email.toLowerCase()));

    return {
      totalEnrolled,
      submittedCount,
      percentage,
      pendingCount: pendingStudents.length,
      pendingStudents,
      completedStudents,
      surveys: db.surveys || []
    };
  },

  // Stats for Admin Overview
  getStats() {
    const totalFeedback = db.feedback.length;
    const unresolvedFeedback = db.feedback.filter(f => f.status !== 'Resolved').length;
    const totalDoubts = db.doubts.length;
    const openDoubts = db.doubts.filter(d => !d.isResolved).length;
    const totalMaterials = db.materials.length;
    const totalAnnouncements = db.announcements.length;
    const totalStudents = (db.students || []).length;
    const surveyStats = this.getSurveyStats();
    
    return {
      totalFeedback,
      unresolvedFeedback,
      resolvedFeedback: totalFeedback - unresolvedFeedback,
      totalDoubts,
      openDoubts,
      resolvedDoubts: totalDoubts - openDoubts,
      totalMaterials,
      totalAnnouncements,
      totalStudents,
      surveyStats
    };
  },

  // ==========================================
  // GOOGLE CLASSROOM SYNC STORAGE
  // ==========================================
  getClassroomFeed() {
    return (db.classroomFeed || []).filter(item => 
      item.id !== 'gc-os-unit3-threads' &&
      item.id !== 'gc-dbms-er-sql-lab' &&
      item.id !== 'gc-dcn-socket-prog' &&
      item.id !== 'gc-math-discrete-recurrence'
    );
  },

  saveClassroomFeed(items) {
    db.classroomFeed = (items || []).filter(item => 
      item.id !== 'gc-os-unit3-threads' &&
      item.id !== 'gc-dbms-er-sql-lab' &&
      item.id !== 'gc-dcn-socket-prog' &&
      item.id !== 'gc-math-discrete-recurrence'
    );
    saveDB();
    return db.classroomFeed;
  },

  addClassroomFeedItem(item) {
    if (!db.classroomFeed) db.classroomFeed = [];
    const exists = db.classroomFeed.find(f => f.id === item.id);
    if (exists) {
      Object.assign(exists, item);
    } else {
      db.classroomFeed.unshift(item);
    }
    saveDB();
    return db.classroomFeed;
  },

  deleteClassroomFeedItem(id) {
    if (!db.classroomFeed) return false;
    db.classroomFeed = db.classroomFeed.filter(f => f.id !== id);
    saveDB();
    return true;
  },

  getClassroomTokens() {
    return db.classroomTokens || null;
  },

  saveClassroomTokens(tokens) {
    db.classroomTokens = {
      ...tokens,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.classroomTokens;
  },

  clearClassroomTokens() {
    db.classroomTokens = null;
    saveDB();
    return true;
  }
};
