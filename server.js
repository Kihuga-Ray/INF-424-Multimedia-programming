const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    salt,
    hash: hashPassword(password, salt)
  };
}

function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const derived = hashPassword(password, record.salt);
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(record.hash, 'hex'));
}

function youtubeEmbedUrl(rawUrl) {
  if (!rawUrl) return '';
  const url = rawUrl.trim();

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  return url;
}

function normalizeCourse(course) {
  return {
    ...course,
    lessons: Array.isArray(course.lessons) ? course.lessons.slice().sort((a, b) => a.order - b.order) : [],
    students: Array.isArray(course.students) ? course.students : [],
    progress: course.progress || {}
  };
}

function createSeedDb() {
  const adminCreds = createPasswordRecord('Admin123!');
  const studentCreds = createPasswordRecord('Student123!');
  const courseOne = {
    id: uid('course'),
    title: 'Foundations of Digital Learning',
    description: 'A starter course that shows how to learn inside the platform, track progress, and complete guided video lessons.',
    category: 'Learning Design',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    lessons: [
      {
        id: uid('lesson'),
        title: 'Welcome to the classroom',
        notes: 'Orientation, course navigation, and how to use the lesson tracker.',
        youtubeUrl: 'https://www.youtube.com/embed/5MgBikgcWnY',
        order: 1
      },
      {
        id: uid('lesson'),
        title: 'Study workflow and milestones',
        notes: 'Use progress checkpoints and assignments to stay on track.',
        youtubeUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
        order: 2
      },
      {
        id: uid('lesson'),
        title: 'Submitting your work',
        notes: 'Review how assignment uploads and feedback cycle work.',
        youtubeUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        order: 3
      }
    ],
    students: [],
    progress: {},
    createdBy: 'seed_admin',
    createdAt: new Date().toISOString()
  };

  const courseTwo = {
    id: uid('course'),
    title: 'Production Media for Education',
    description: 'Plan multimedia lessons, embed YouTube tutorials, and package resources for a polished learning experience.',
    category: 'Multimedia',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    lessons: [
      {
        id: uid('lesson'),
        title: 'Storyboarding a lesson',
        notes: 'Map goals, media, and learner actions before you record anything.',
        youtubeUrl: 'https://www.youtube.com/embed/jG2NMk2llz4',
        order: 1
      },
      {
        id: uid('lesson'),
        title: 'Publishing engaging video content',
        notes: 'Balance pacing, thumbnails, and video embeds for effective delivery.',
        youtubeUrl: 'https://www.youtube.com/embed/TL8mmew3bYo',
        order: 2
      }
    ],
    students: [],
    progress: {},
    createdBy: 'seed_admin',
    createdAt: new Date().toISOString()
  };

  const assignment = {
    id: uid('assignment'),
    courseId: courseOne.id,
    title: 'Learning reflection brief',
    description: 'Write a one-page reflection on how the dashboard helps you stay accountable.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
    fileName: 'reflection-template.pdf',
    fileDataUrl: null,
    createdBy: 'seed_admin',
    createdAt: new Date().toISOString()
  };

  courseOne.students = ['seed_student'];
  courseOne.progress = {
    seed_student: {
      completedLessonIds: [courseOne.lessons[0].id],
      lastViewedLessonId: courseOne.lessons[0].id
    }
  };

  return {
    users: [
      {
        id: 'seed_admin',
        name: 'Platform Admin',
        email: 'admin@edusphere.local',
        role: 'admin',
        password: adminCreds
      },
      {
        id: 'seed_student',
        name: 'Demo Student',
        email: 'student@edusphere.local',
        role: 'student',
        password: studentCreds
      }
    ],
    courses: [courseOne, courseTwo],
    assignments: [assignment],
    sessions: []
  };
}

function loadDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }

  const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  parsed.users = parsed.users || [];
  parsed.courses = (parsed.courses || []).map(normalizeCourse);
  parsed.assignments = parsed.assignments || [];
  parsed.sessions = parsed.sessions || [];
  return parsed;
}

function saveDb(db) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDb();

function json(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(text);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) acc[key] = value;
    return acc;
  }, {});
}

function setSessionCookie(res, token) {
  const cookie = `sid=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const session = db.sessions.find((entry) => entry.token === cookies.sid);
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

function requireUser(req, res) {
  const user = getSessionUser(req);
  if (!user) {
    json(res, 401, { error: 'Please sign in to continue.' });
    return null;
  }
  return user;
}

function requireRole(req, res, role) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== role) {
    json(res, 403, { error: 'You do not have permission to perform this action.' });
    return null;
  }
  return user;
}

async function readBody(req, limit = 8 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const err = new Error('Payload too large');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function publicCourse(course, userId) {
  const progress = course.progress?.[userId] || { completedLessonIds: [], lastViewedLessonId: null };
  const completedLessonIds = progress.completedLessonIds || [];
  const lessons = course.lessons || [];
  const completedCount = completedLessonIds.length;
  const progressPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) || lessons[0] || null;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    thumbnail: course.thumbnail,
    lessons,
    isEnrolled: (course.students || []).includes(userId),
    progressPercent,
    completedCount,
    totalLessons: lessons.length,
    nextLesson,
    lastViewedLessonId: progress.lastViewedLessonId || null,
    completedLessonIds,
    enrollmentCount: (course.students || []).length
  };
}

function dashboardPayload(user) {
  const courses = db.courses.map((course) => publicCourse(course, user.id));
  const assignments = db.assignments
    .filter((assignment) => user.role === 'admin' || courses.find((course) => course.id === assignment.courseId)?.isEnrolled)
    .map((assignment) => {
      const course = db.courses.find((entry) => entry.id === assignment.courseId);
      return {
        ...assignment,
        courseTitle: course ? course.title : 'Unknown course'
      };
    });

  if (user.role === 'admin') {
    const studentCount = db.users.filter((entry) => entry.role === 'student').length;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      metrics: {
        courses: db.courses.length,
        assignments: db.assignments.length,
        students: studentCount
      },
      courses,
      assignments,
      students: db.users.filter((entry) => entry.role === 'student').map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        enrolledCourses: db.courses.filter((course) => (course.students || []).includes(student.id)).length
      }))
    };
  }

  const enrolledCourses = courses.filter((course) => course.isEnrolled);
  const completedLessons = enrolledCourses.reduce((sum, course) => sum + course.completedCount, 0);
  const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.totalLessons, 0);
  const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    metrics: {
      courses: enrolledCourses.length,
      assignments: assignments.length,
      progress: completionRate
    },
    courses,
    assignments,
    focusCourse: enrolledCourses[0] || courses[0] || null
  };
}

function handleLogin(res, payload) {
  const { email, password } = payload;
  const user = db.users.find((entry) => entry.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !verifyPassword(password || '', user.password)) {
    json(res, 401, { error: 'Invalid email or password.' });
    return;
  }

  const token = crypto.randomBytes(24).toString('hex');
  db.sessions = db.sessions.filter((entry) => entry.userId !== user.id);
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  saveDb(db);
  setSessionCookie(res, token);
  json(res, 200, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

function handleRegister(res, payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!name || !email || password.length < 8) {
    json(res, 400, { error: 'Provide a name, email, and an 8+ character password.' });
    return;
  }

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    json(res, 409, { error: 'That email is already registered.' });
    return;
  }

  const token = crypto.randomBytes(24).toString('hex');
  const passwordRecord = createPasswordRecord(password);
  const user = {
    id: uid('user'),
    name,
    email,
    role: 'student',
    password: passwordRecord
  };

  db.users.push(user);
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  saveDb(db);
  setSessionCookie(res, token);
  json(res, 201, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

function addCourse(user, payload, res) {
  const title = String(payload.title || '').trim();
  const description = String(payload.description || '').trim();
  const category = String(payload.category || '').trim() || 'General';
  const level = String(payload.level || '').trim() || 'Beginner';
  const thumbnail = String(payload.thumbnail || '').trim();
  const lessonsInput = Array.isArray(payload.lessons) ? payload.lessons : [];
  const lessons = lessonsInput
    .map((lesson, index) => ({
      id: uid('lesson'),
      title: String(lesson.title || '').trim(),
      notes: String(lesson.notes || '').trim(),
      youtubeUrl: youtubeEmbedUrl(lesson.youtubeUrl || ''),
      order: Number.isFinite(Number(lesson.order)) ? Number(lesson.order) : index + 1
    }))
    .filter((lesson) => lesson.title && lesson.youtubeUrl);

  if (!title || !description || !lessons.length) {
    json(res, 400, { error: 'Course title, description, and at least one lesson are required.' });
    return;
  }

  const course = normalizeCourse({
    id: uid('course'),
    title,
    description,
    category,
    level,
    thumbnail: thumbnail || null,
    lessons,
    students: [],
    progress: {},
    createdBy: user.id,
    createdAt: new Date().toISOString()
  });

  db.courses.unshift(course);
  saveDb(db);
  json(res, 201, { course });
}

function addAssignment(user, payload, res) {
  const courseId = String(payload.courseId || '').trim();
  const title = String(payload.title || '').trim();
  const description = String(payload.description || '').trim();
  const dueDate = String(payload.dueDate || '').trim();
  const thumbnail = String(payload.thumbnail || '').trim();
  const fileName = String(payload.fileName || '').trim();
  const fileDataUrl = String(payload.fileDataUrl || '').trim();

  if (!courseId || !title || !description) {
    json(res, 400, { error: 'Assignment course, title, and description are required.' });
    return;
  }

  const course = db.courses.find((entry) => entry.id === courseId);
  if (!course) {
    json(res, 404, { error: 'Course not found.' });
    return;
  }

  const assignment = {
    id: uid('assignment'),
    courseId,
    title,
    description,
    dueDate: dueDate || null,
    thumbnail: thumbnail || null,
    fileName: fileName || null,
    fileDataUrl: fileDataUrl || null,
    createdBy: user.id,
    createdAt: new Date().toISOString()
  };

  db.assignments.unshift(assignment);
  saveDb(db);
  json(res, 201, { assignment });
}

function enrollCourse(user, courseId, res) {
  const course = db.courses.find((entry) => entry.id === courseId);
  if (!course) {
    json(res, 404, { error: 'Course not found.' });
    return;
  }

  course.students = course.students || [];
  if (!course.students.includes(user.id)) {
    course.students.push(user.id);
  }
  course.progress = course.progress || {};
  if (!course.progress[user.id]) {
    course.progress[user.id] = { completedLessonIds: [], lastViewedLessonId: null };
  }

  saveDb(db);
  json(res, 200, { course: publicCourse(course, user.id) });
}

function updateProgress(user, courseId, payload, res) {
  const course = db.courses.find((entry) => entry.id === courseId);
  if (!course) {
    json(res, 404, { error: 'Course not found.' });
    return;
  }

  course.progress = course.progress || {};
  course.students = course.students || [];
  if (!course.students.includes(user.id)) {
    course.students.push(user.id);
  }

  const lessonId = String(payload.lessonId || '').trim();
  if (!lessonId) {
    json(res, 400, { error: 'A lesson ID is required.' });
    return;
  }

  const lesson = (course.lessons || []).find((entry) => entry.id === lessonId);
  if (!lesson) {
    json(res, 404, { error: 'Lesson not found.' });
    return;
  }

  const progress = course.progress[user.id] || { completedLessonIds: [], lastViewedLessonId: null };
  const completed = new Set(progress.completedLessonIds || []);
  completed.add(lessonId);
  course.progress[user.id] = {
    completedLessonIds: Array.from(completed),
    lastViewedLessonId: lessonId
  };

  saveDb(db);
  json(res, 200, { course: publicCourse(course, user.id) });
}

function serveStatic(req, res, requestPath) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const fullPath = path.resolve(ROOT, `.${safePath}`);
  if (!fullPath.startsWith(ROOT)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(fullPath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (pathname === '/api/session' && req.method === 'GET') {
      const user = getSessionUser(req);
      return json(res, 200, { user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null });
    }

    if (pathname === '/api/dashboard' && req.method === 'GET') {
      const user = requireUser(req, res);
      if (!user) return;
      return json(res, 200, dashboardPayload(user));
    }

    if (pathname === '/api/login' && req.method === 'POST') {
      const body = await readBody(req);
      return handleLogin(res, body);
    }

    if (pathname === '/api/register' && req.method === 'POST') {
      const body = await readBody(req);
      return handleRegister(res, body);
    }

    if (pathname === '/api/logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      db.sessions = db.sessions.filter((entry) => entry.token !== cookies.sid);
      saveDb(db);
      clearSessionCookie(res);
      return json(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/courses' && req.method === 'POST') {
      const user = requireRole(req, res, 'admin');
      if (!user) return;
      const body = await readBody(req);
      return addCourse(user, body, res);
    }

    if (pathname === '/api/admin/assignments' && req.method === 'POST') {
      const user = requireRole(req, res, 'admin');
      if (!user) return;
      const body = await readBody(req);
      return addAssignment(user, body, res);
    }

    if (pathname.match(/^\/api\/courses\/[^/]+\/enroll$/) && req.method === 'POST') {
      const user = requireRole(req, res, 'student');
      if (!user) return;
      const courseId = pathname.split('/')[3];
      return enrollCourse(user, courseId, res);
    }

    if (pathname.match(/^\/api\/courses\/[^/]+\/progress$/) && req.method === 'PATCH') {
      const user = requireRole(req, res, 'student');
      if (!user) return;
      const courseId = pathname.split('/')[3];
      const body = await readBody(req);
      return updateProgress(user, courseId, body, res);
    }

    if (pathname.startsWith('/api/')) {
      return json(res, 404, { error: 'API route not found.' });
    }

    return serveStatic(req, res, pathname);
  } catch (error) {
    const status = error.statusCode || 500;
    console.error(error);
    return json(res, status, { error: status === 500 ? 'Something went wrong on the server.' : error.message });
  }
});

server.listen(PORT, () => {
  console.log(`EduSphere server running at http://localhost:${PORT}`);
});
