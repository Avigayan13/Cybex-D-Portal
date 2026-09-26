import { google } from 'googleapis';
import { Database } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

function getOAuth2Client(redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/classroom/oauth-callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
}

// Initial Sample Section D Classroom Feed (Pre-seeded for instant UX)
export const initialClassroomFeed = [
  {
    id: 'gc-os-unit3-threads',
    courseId: 'cse203-os',
    courseName: 'Operating Systems (CSE 203)',
    courseCode: 'CSE 203',
    section: 'Section D',
    faculty: 'Dr. Faculty (Operating Systems)',
    title: 'Unit 3: Multithreading Models & POSIX Pthreads Notes + PDF',
    text: 'Dear Students, please find attached the complete lecture slides and reference notes on CPU Scheduling and POSIX Pthreads for Unit 3. Review for upcoming lab evaluations.',
    type: 'material',
    creationTime: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updateTime: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    attachments: [
      {
        title: 'OS_Unit_3_Multithreading_Scheduling.pdf',
        fileType: 'pdf',
        url: 'https://drive.google.com',
        alternateLink: 'https://drive.google.com',
        hasDirectPreview: true
      },
      {
        title: 'POSIX_Pthreads_Lab_Codes.c',
        fileType: 'code',
        url: 'https://drive.google.com',
        alternateLink: 'https://drive.google.com'
      }
    ]
  },
  {
    id: 'gc-dbms-er-sql-lab',
    courseId: 'cse202-dbms',
    courseName: 'Database Management Systems (CSE 202)',
    courseCode: 'CSE 202',
    section: 'Section D',
    faculty: 'Faculty (DBMS)',
    title: 'Lab Sheet 4: Complex SQL Queries & Joins Practice PDF',
    text: 'Complete all queries from Lab Sheet 4 before Friday S 312 session. Submission via portal or classroom assignment tab.',
    type: 'assignment',
    creationTime: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    updateTime: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    attachments: [
      {
        title: 'DBMS_Lab_Sheet_4_SQL_Joins_Subqueries.pdf',
        fileType: 'pdf',
        url: 'https://drive.google.com',
        alternateLink: 'https://drive.google.com',
        hasDirectPreview: true
      }
    ]
  },
  {
    id: 'gc-dcn-socket-prog',
    courseId: 'cse205-dcn',
    courseName: 'Data Communications & Networking (CSE 205)',
    courseCode: 'CSE 205',
    section: 'Section D',
    faculty: 'Dr. Faculty (DCN)',
    title: 'Lecture Slides: OSI Model vs TCP/IP & IP Subnetting Formulae',
    text: 'Please review the attached Class slides for Class 12 on CIDR Subnetting, IP Addressing, and Routing protocols.',
    type: 'material',
    creationTime: new Date(Date.now() - 3600 * 1000 * 32).toISOString(),
    updateTime: new Date(Date.now() - 3600 * 1000 * 32).toISOString(),
    attachments: [
      {
        title: 'DCN_Class_12_Subnetting_CIDR_Formulas.pdf',
        fileType: 'pdf',
        url: 'https://drive.google.com',
        alternateLink: 'https://drive.google.com',
        hasDirectPreview: true
      }
    ]
  },
  {
    id: 'gc-math-discrete-recurrence',
    courseId: 'mat201-dm',
    courseName: 'Discrete Mathematics (MAT 201)',
    courseCode: 'MAT 201',
    section: 'Section D',
    faculty: 'Prof. Faculty (Math)',
    title: 'Tutorial Sheet 3: Generating Functions & Recurrence Relations',
    text: 'Tutorial 3 solutions and unsolved problems for midterm exam prep. Solve questions 1 through 12.',
    type: 'material',
    creationTime: new Date(Date.now() - 3600 * 1000 * 55).toISOString(),
    updateTime: new Date(Date.now() - 3600 * 1000 * 55).toISOString(),
    attachments: [
      {
        title: 'Discrete_Math_Tutorial_3_Recurrence_Relations.pdf',
        fileType: 'pdf',
        url: 'https://drive.google.com',
        alternateLink: 'https://drive.google.com',
        hasDirectPreview: true
      }
    ]
  }
];

export const ClassroomService = {
  isConfigured() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  },

  isConnected(customTokens = null) {
    if (customTokens && (customTokens.access_token || customTokens.refresh_token)) {
      return true;
    }
    if (process.env.GOOGLE_CLASSROOM_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN) {
      return true;
    }
    const tokens = Database.getClassroomTokens();
    return Boolean(tokens && (tokens.access_token || tokens.refresh_token));
  },

  getAuthUrl(redirectUri) {
    const oauth2Client = getOAuth2Client(redirectUri);
    if (!oauth2Client) {
      throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) not set in environment.');
    }

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES
    });
  },

  async handleCallback(code, redirectUri) {
    const oauth2Client = getOAuth2Client(redirectUri);
    if (!oauth2Client) {
      throw new Error('Google OAuth credentials not configured.');
    }

    const { tokens } = await oauth2Client.getToken(code);
    Database.saveClassroomTokens(tokens);

    // Trigger initial sync with these fresh tokens
    try {
      await this.syncClassroomFeed(redirectUri, tokens);
    } catch (err) {
      console.error('Initial sync error after auth:', err.message);
    }

    return tokens;
  },

  async getAuthenticatedClient(redirectUri, customTokens = null) {
    let tokens = customTokens;
    
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      tokens = Database.getClassroomTokens();
    }
    
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      const envRefresh = process.env.GOOGLE_CLASSROOM_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
      if (envRefresh) {
        tokens = { refresh_token: envRefresh };
      }
    }

    if (!tokens) return null;

    const oauth2Client = getOAuth2Client(redirectUri);
    if (!oauth2Client) return null;

    oauth2Client.setCredentials(tokens);

    // Handle token refresh automatically
    oauth2Client.on('tokens', (newTokens) => {
      Database.saveClassroomTokens({
        ...tokens,
        ...newTokens
      });
    });

    return oauth2Client;
  },

  async syncClassroomFeed(redirectUri, customTokens = null) {
    const auth = await this.getAuthenticatedClient(redirectUri, customTokens);
    if (!auth) {
      // If not authenticated, return existing feed
      const existing = Database.getClassroomFeed();
      if (!existing || existing.length === 0) {
        Database.saveClassroomFeed(initialClassroomFeed);
      }
      return Database.getClassroomFeed();
    }

    const classroom = google.classroom({ version: 'v1', auth });
    
    // 1. Fetch active courses where user is enrolled as Student or Teacher
    const coursesMap = new Map();

    // Query A: Student enrolled courses
    try {
      const studentRes = await classroom.courses.list({
        studentId: 'me',
        pageSize: 50
      });
      if (studentRes.data.courses) {
        for (const c of studentRes.data.courses) {
          if (c.id) coursesMap.set(c.id, c);
        }
      }
    } catch (e) {
      console.warn('[CLASSROOM] student courses query:', e.message);
    }

    // Query B: All accessible courses
    try {
      const allRes = await classroom.courses.list({
        pageSize: 50
      });
      if (allRes.data.courses) {
        for (const c of allRes.data.courses) {
          if (c.id && !coursesMap.has(c.id)) {
            coursesMap.set(c.id, c);
          }
        }
      }
    } catch (e) {
      console.warn('[CLASSROOM] all courses query:', e.message);
    }

    // Query C: Teacher courses if any
    try {
      const teacherRes = await classroom.courses.list({
        teacherId: 'me',
        pageSize: 50
      });
      if (teacherRes.data.courses) {
        for (const c of teacherRes.data.courses) {
          if (c.id && !coursesMap.has(c.id)) {
            coursesMap.set(c.id, c);
          }
        }
      }
    } catch (e) {
      console.warn('[CLASSROOM] teacher courses query:', e.message);
    }

    const courses = Array.from(coursesMap.values());
    console.log(`[CLASSROOM] Found ${courses.length} courses for Section D.`);

    const allItems = [];

    for (const course of courses) {
      const courseId = course.id;
      const courseName = course.name || 'Section D Course';
      const section = course.section || 'CSE-D';

      // A. Fetch Announcements
      try {
        const annRes = await classroom.courses.announcements.list({
          courseId,
          pageSize: 20
        });

        const announcements = annRes.data.announcements || [];
        for (const a of announcements) {
          const attachments = [];
          if (a.materials) {
            for (const m of a.materials) {
              const df = m.driveFile?.driveFile || m.driveFile;
              if (df) {
                const isPdf = (df.title || '').toLowerCase().endsWith('.pdf');
                const fileUrl = df.alternateLink || (df.id ? `https://drive.google.com/file/d/${df.id}/view` : 'https://drive.google.com');
                attachments.push({
                  title: df.title || 'Attached Document',
                  fileType: isPdf ? 'pdf' : 'doc',
                  url: fileUrl,
                  alternateLink: fileUrl,
                  thumbnailUrl: df.thumbnailUrl || null,
                  driveFileId: df.id || null,
                  hasDirectPreview: true
                });
              } else if (m.link) {
                attachments.push({
                  title: m.link.title || m.link.url,
                  fileType: 'link',
                  url: m.link.url,
                  alternateLink: m.link.url
                });
              } else if (m.youtubeVideo) {
                attachments.push({
                  title: m.youtubeVideo.title || 'YouTube Video',
                  fileType: 'video',
                  url: m.youtubeVideo.alternateLink,
                  alternateLink: m.youtubeVideo.alternateLink
                });
              } else if (m.form) {
                attachments.push({
                  title: m.form.title || 'Google Form / Quiz',
                  fileType: 'link',
                  url: m.form.formUrl,
                  alternateLink: m.form.formUrl
                });
              }
            }
          }

          allItems.push({
            id: `gc-ann-${a.id}`,
            courseId,
            courseName,
            section,
            faculty: a.creatorUserId || course.ownerId || 'Course Instructor',
            title: a.text ? (a.text.slice(0, 80) + (a.text.length > 80 ? '...' : '')) : 'Classroom Notice',
            text: a.text || '',
            type: 'announcement',
            creationTime: a.creationTime || new Date().toISOString(),
            updateTime: a.updateTime || new Date().toISOString(),
            attachments
          });
        }
      } catch (annErr) {
        console.warn(`[CLASSROOM] Announcements note for ${courseName}:`, annErr.message);
      }

      // B. Fetch Coursework Materials (Lecture Notes, PDFs, Syllabus)
      try {
        const matRes = await classroom.courses.courseWorkMaterials.list({
          courseId,
          pageSize: 20
        });

        const materials = matRes.data.courseWorkMaterial || [];
        for (const m of materials) {
          const attachments = [];
          if (m.materials) {
            for (const item of m.materials) {
              const df = item.driveFile?.driveFile || item.driveFile;
              if (df) {
                const isPdf = (df.title || '').toLowerCase().endsWith('.pdf');
                const fileUrl = df.alternateLink || (df.id ? `https://drive.google.com/file/d/${df.id}/view` : 'https://drive.google.com');
                attachments.push({
                  title: df.title || 'Course Material',
                  fileType: isPdf ? 'pdf' : 'doc',
                  url: fileUrl,
                  alternateLink: fileUrl,
                  thumbnailUrl: df.thumbnailUrl || null,
                  driveFileId: df.id || null,
                  hasDirectPreview: true
                });
              } else if (item.link) {
                attachments.push({
                  title: item.link.title || item.link.url,
                  fileType: 'link',
                  url: item.link.url,
                  alternateLink: item.link.url
                });
              } else if (item.youtubeVideo) {
                attachments.push({
                  title: item.youtubeVideo.title || 'YouTube Video',
                  fileType: 'video',
                  url: item.youtubeVideo.alternateLink,
                  alternateLink: item.youtubeVideo.alternateLink
                });
              } else if (item.form) {
                attachments.push({
                  title: item.form.title || 'Google Form / Quiz',
                  fileType: 'link',
                  url: item.form.formUrl,
                  alternateLink: item.form.formUrl
                });
              }
            }
          }

          allItems.push({
            id: `gc-mat-${m.id}`,
            courseId,
            courseName,
            section,
            faculty: course.name ? `Faculty (${course.name})` : 'Course Instructor',
            title: m.title || 'Lecture Material',
            text: m.description || '',
            type: 'material',
            creationTime: m.creationTime || new Date().toISOString(),
            updateTime: m.updateTime || new Date().toISOString(),
            attachments
          });
        }
      } catch (matErr) {
        console.warn(`[CLASSROOM] Materials note for ${courseName}:`, matErr.message);
      }

      // C. Fetch Coursework (Assignments & Homework PDFs)
      try {
        const workRes = await classroom.courses.courseWork.list({
          courseId,
          pageSize: 20
        });

        const coursework = workRes.data.courseWork || [];
        for (const cw of coursework) {
          const attachments = [];
          if (cw.materials) {
            for (const item of cw.materials) {
              const df = item.driveFile?.driveFile || item.driveFile;
              if (df) {
                const isPdf = (df.title || '').toLowerCase().endsWith('.pdf');
                const fileUrl = df.alternateLink || (df.id ? `https://drive.google.com/file/d/${df.id}/view` : 'https://drive.google.com');
                attachments.push({
                  title: df.title || 'Assignment Document',
                  fileType: isPdf ? 'pdf' : 'doc',
                  url: fileUrl,
                  alternateLink: fileUrl,
                  thumbnailUrl: df.thumbnailUrl || null,
                  driveFileId: df.id || null,
                  hasDirectPreview: true
                });
              } else if (item.link) {
                attachments.push({
                  title: item.link.title || item.link.url,
                  fileType: 'link',
                  url: item.link.url,
                  alternateLink: item.link.url
                });
              } else if (item.youtubeVideo) {
                attachments.push({
                  title: item.youtubeVideo.title || 'YouTube Video',
                  fileType: 'video',
                  url: item.youtubeVideo.alternateLink,
                  alternateLink: item.youtubeVideo.alternateLink
                });
              } else if (item.form) {
                attachments.push({
                  title: item.form.title || 'Google Form / Quiz',
                  fileType: 'link',
                  url: item.form.formUrl,
                  alternateLink: item.form.formUrl
                });
              }
            }
          }

          allItems.push({
            id: `gc-work-${cw.id}`,
            courseId,
            courseName,
            section,
            faculty: 'Course Faculty',
            title: cw.title || 'Class Assignment',
            text: cw.description || '',
            type: 'assignment',
            dueDate: cw.dueDate ? `${cw.dueDate.day}/${cw.dueDate.month}/${cw.dueDate.year}` : null,
            creationTime: cw.creationTime || new Date().toISOString(),
            updateTime: cw.updateTime || new Date().toISOString(),
            attachments
          });
        }
      } catch (cwErr) {
        console.warn(`[CLASSROOM] Coursework note for ${courseName}:`, cwErr.message);
      }
    }

    // Merge newly fetched items with existing feed and pre-seeded Section D courses
    const existing = Database.getClassroomFeed() || [];
    const mergedMap = new Map();

    // 1. Add all fetched items
    for (const item of allItems) {
      if (item && item.id) mergedMap.set(item.id, item);
    }

    // 2. Add existing cached items
    for (const item of existing) {
      if (item && item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    }

    // 3. Ensure baseline Section D courses are always available
    for (const item of initialClassroomFeed) {
      if (item && item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    }

    const finalFeed = Array.from(mergedMap.values());
    finalFeed.sort((a, b) => new Date(b.creationTime || 0) - new Date(a.creationTime || 0));

    Database.saveClassroomFeed(finalFeed);
    return finalFeed;
  },

  getFeed() {
    const feed = Database.getClassroomFeed();
    if (!feed || feed.length === 0) {
      Database.saveClassroomFeed(initialClassroomFeed);
      return initialClassroomFeed;
    }
    return feed;
  }
};
