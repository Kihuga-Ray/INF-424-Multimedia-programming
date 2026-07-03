const state = {
  session: null,
  dashboard: null,
  selectedCourseId: null,
  selectedLessonId: null,
  authMode: 'login'
};

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  bindElements();
  bindTheme();
  bindAuthTabs();
  bindForms();
  bindButtons();
  restoreTheme();
  loadSession();
});

function bindElements() {
  const ids = [
    'themeToggle',
    'logoutBtn',
    'accountBadge',
    'loginTab',
    'registerTab',
    'loginPanel',
    'registerPanel',
    'loginForm',
    'registerForm',
    'learn',
    'admin',
    'studentMetrics',
    'adminMetrics',
    'courseList',
    'assignmentList',
    'currentCourseTag',
    'currentCourseTitle',
    'currentCourseDescription',
    'courseProgressText',
    'courseProgressCount',
    'courseProgressBar',
    'lessonFrame',
    'lessonTitle',
    'lessonNotes',
    'completeLessonBtn',
    'lessonList',
    'assignmentCourseSelect',
    'createCourseForm',
    'createAssignmentForm',
    'lessonBuilder',
    'addLessonBtn',
    'adminCourseList',
    'adminAssignmentList',
    'toastHost'
  ];

  ids.forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindTheme() {
  els.themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  });
}

function restoreTheme() {
  const stored = localStorage.getItem('edusphere-theme') || 'dark';
  setTheme(stored);
}

function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
    els.themeToggle.textContent = 'Sun';
  } else {
    document.documentElement.removeAttribute('data-theme');
    els.themeToggle.textContent = 'Moon';
  }
  localStorage.setItem('edusphere-theme', theme);
}

function bindAuthTabs() {
  els.loginTab?.addEventListener('click', () => showAuthMode('login'));
  els.registerTab?.addEventListener('click', () => showAuthMode('register'));
}

function showAuthMode(mode) {
  state.authMode = mode;
  const loginActive = mode === 'login';
  els.loginTab.classList.toggle('active', loginActive);
  els.registerTab.classList.toggle('active', !loginActive);
  els.loginTab.setAttribute('aria-selected', loginActive ? 'true' : 'false');
  els.registerTab.setAttribute('aria-selected', !loginActive ? 'true' : 'false');
  els.loginPanel.classList.toggle('hidden', !loginActive);
  els.registerPanel.classList.toggle('hidden', loginActive);
}

function bindForms() {
  els.loginForm?.addEventListener('submit', handleLogin);
  els.registerForm?.addEventListener('submit', handleRegister);
  els.createCourseForm?.addEventListener('submit', handleCreateCourse);
  els.createAssignmentForm?.addEventListener('submit', handleCreateAssignment);
}

function bindButtons() {
  els.logoutBtn?.addEventListener('click', handleLogout);
  els.completeLessonBtn?.addEventListener('click', markLessonComplete);
  els.addLessonBtn?.addEventListener('click', () => addLessonBuilderRow());
}

async function loadSession() {
  try {
    const response = await api('/api/session');
    state.session = response.user;
    if (state.session) {
      await loadDashboard();
    } else {
      renderGuest();
      addLessonBuilderRow();
      addLessonBuilderRow();
    }
  } catch (error) {
    toast(error.message, 'error');
    renderGuest();
  }
}

function renderGuest() {
  els.learn.classList.add('hidden');
  els.admin.classList.add('hidden');
  els.accountBadge.textContent = 'Guest mode';
  els.logoutBtn.classList.add('hidden');
  state.dashboard = null;
  els.lessonFrame.src = 'about:blank';
  els.currentCourseTag.textContent = 'No course selected';
  els.currentCourseTitle.textContent = 'Sign in to unlock your course dashboard';
  els.currentCourseDescription.textContent = 'Once you log in, the selected course will load here with embedded lessons and progress updates.';
  els.lessonTitle.textContent = 'No lesson selected yet';
  els.lessonNotes.textContent = 'Choose a course and a lesson to continue.';
  els.courseProgressText.textContent = '0% complete';
  els.courseProgressCount.textContent = '0 / 0 lessons';
  els.courseProgressBar.style.width = '0%';
  els.studentMetrics.innerHTML = '';
  els.adminMetrics.innerHTML = '';
  els.courseList.innerHTML = '';
  els.assignmentList.innerHTML = '';
  els.lessonList.innerHTML = '';
  els.adminCourseList.innerHTML = '';
  els.adminAssignmentList.innerHTML = '';
  els.assignmentCourseSelect.innerHTML = '';
  setCompleteButtonState(false);
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  state.dashboard = data;
  state.selectedCourseId = state.selectedCourseId || getDefaultCourseId();
  const course = getSelectedCourse();
  if (course && !state.selectedLessonId) {
    state.selectedLessonId = course.lastViewedLessonId || course.nextLesson?.id || course.lessons?.[0]?.id || null;
  }
  renderDashboard();
}

function renderDashboard() {
  if (!state.dashboard || !state.session) return;

  const isAdmin = state.session.role === 'admin';
  els.learn.classList.toggle('hidden', isAdmin);
  els.admin.classList.toggle('hidden', !isAdmin);
  els.logoutBtn.classList.remove('hidden');
  els.accountBadge.textContent = `${state.session.name} | ${state.session.role}`;

  if (isAdmin) {
    if (!els.lessonBuilder.children.length) {
      addLessonBuilderRow();
      addLessonBuilderRow();
    }
    renderAdminMetrics();
    renderAdminLibrary();
    renderAssignmentCourseSelect();
  } else {
    renderStudentMetrics();
    renderStudentLibrary();
    renderStudentAssignments();
    renderCoursePlayer();
  }
}

function renderStudentMetrics() {
  const metrics = state.dashboard.metrics || {};
  els.studentMetrics.innerHTML = [
    chip(`${metrics.courses || 0} enrolled courses`),
    chip(`${metrics.assignments || 0} assignments`),
    chip(`${metrics.progress || 0}% overall progress`)
  ].join('');
}

function renderAdminMetrics() {
  const metrics = state.dashboard.metrics || {};
  els.adminMetrics.innerHTML = [
    chip(`${metrics.courses || 0} courses`),
    chip(`${metrics.assignments || 0} assignments`),
    chip(`${metrics.students || 0} students`)
  ].join('');
}

function renderStudentLibrary() {
  const courses = state.dashboard.courses || [];
  els.courseList.innerHTML = courses.map((course) => {
    const active = course.id === state.selectedCourseId ? 'active' : '';
    const status = course.isEnrolled ? 'complete' : 'pending';
    const buttonLabel = course.isEnrolled ? 'Open course' : 'Enroll';
    return `
      <article class="course-card ${active}">
        <div class="course-card-top">
          <div>
            <span class="tag ${status}">${course.isEnrolled ? 'Enrolled' : 'Available'}</span>
            <h4>${escapeHtml(course.title)}</h4>
            <p>${escapeHtml(course.category)} · ${escapeHtml(course.level)}</p>
          </div>
          <button class="btn btn-small btn-secondary" type="button" data-course-action="${course.id}">
            ${buttonLabel}
          </button>
        </div>
        <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${course.progressPercent || 0}%"></div></div>
        <p>${course.progressPercent || 0}% complete · ${course.completedCount || 0}/${course.totalLessons || 0} lessons</p>
      </article>
    `;
  }).join('');

  els.courseList.querySelectorAll('[data-course-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const courseId = button.dataset.courseAction;
      const course = state.dashboard.courses.find((entry) => entry.id === courseId);
      if (!course?.isEnrolled) {
        await api(`/api/courses/${courseId}/enroll`, { method: 'POST' });
        toast('Course added to your dashboard.', 'success');
      }
      state.selectedCourseId = courseId;
      state.selectedLessonId = null;
      await loadDashboard();
    });
  });
}

function renderStudentAssignments() {
  const enrolledCourseIds = new Set(
    (state.dashboard.courses || []).filter((course) => course.isEnrolled).map((course) => course.id)
  );
  const assignments = (state.dashboard.assignments || []).filter((assignment) => enrolledCourseIds.has(assignment.courseId));

  if (!assignments.length) {
    els.assignmentList.innerHTML = emptyState('No assignments yet', 'When an admin posts work for your courses, it will appear here.');
    return;
  }

  els.assignmentList.innerHTML = assignments.map((assignment) => `
    <article class="assignment-card">
      ${assignment.thumbnail ? `<img class="assignment-thumb" src="${sanitizeUrl(assignment.thumbnail)}" alt="${escapeHtml(assignment.title)} thumbnail">` : ''}
      <span class="tag pending">${escapeHtml(assignment.courseTitle)}</span>
      <h4>${escapeHtml(assignment.title)}</h4>
      <p>${escapeHtml(assignment.description)}</p>
      <div class="card-row">
        <span class="pill">${assignment.dueDate ? `Due ${escapeHtml(assignment.dueDate)}` : 'No due date'}</span>
        ${assignment.fileDataUrl ? `<a class="btn btn-small btn-secondary" href="${sanitizeUrl(assignment.fileDataUrl)}" download="${escapeHtml(assignment.fileName || 'assignment-file')}">Download</a>` : '<span class="pill">No file attached</span>'}
      </div>
    </article>
  `).join('');
}

function renderCoursePlayer() {
  const course = getSelectedCourse();
  if (!course) {
    setCompleteButtonState(false);
    return;
  }

  const lessons = course.lessons || [];
  const selectedLesson =
    lessons.find((lesson) => lesson.id === state.selectedLessonId) ||
    lessons.find((lesson) => lesson.id === course.lastViewedLessonId) ||
    course.nextLesson ||
    lessons[0];

  if (selectedLesson) {
    state.selectedLessonId = selectedLesson.id;
  }

  const selectedLessonCompleted = selectedLesson
    ? (course.completedLessonIds || []).includes(selectedLesson.id)
    : false;

  els.currentCourseTag.textContent = `${course.category} | ${course.level}`;
  els.currentCourseTitle.textContent = course.title;
  els.currentCourseDescription.textContent = course.description;
  els.courseProgressText.textContent = `${course.progressPercent || 0}% complete`;
  els.courseProgressCount.textContent = `${course.completedCount || 0} / ${course.totalLessons || 0} lessons`;
  els.courseProgressBar.style.width = `${course.progressPercent || 0}%`;
  els.lessonFrame.src = selectedLesson?.youtubeUrl || 'about:blank';
  els.lessonTitle.textContent = selectedLesson?.title || 'No lesson selected';
  els.lessonNotes.textContent = selectedLesson?.notes || 'Select a lesson to begin.';
  setCompleteButtonState(Boolean(selectedLesson && !selectedLessonCompleted));

  els.lessonList.innerHTML = lessons.map((lesson) => {
    const completed = (course.completedLessonIds || []).includes(lesson.id);
    const active = lesson.id === selectedLesson?.id ? 'active' : '';
    const status = completed ? 'complete' : 'pending';
    return `
      <article class="lesson-card ${active} ${completed ? 'completed' : ''}">
        <div>
          <span class="tag ${status}">${completed ? 'Completed' : 'In progress'}</span>
          <h4>${escapeHtml(lesson.title)}</h4>
          <p>${escapeHtml(lesson.notes || '')}</p>
        </div>
        <button class="btn btn-small btn-secondary" type="button" data-lesson-id="${lesson.id}">Watch</button>
      </article>
    `;
  }).join('');

  els.lessonList.querySelectorAll('[data-lesson-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedLessonId = button.dataset.lessonId;
      renderCoursePlayer();
    });
  });
}

function renderAdminLibrary() {
  els.adminCourseList.innerHTML = (state.dashboard.courses || []).map((course) => `
    <article class="library-card">
      ${course.thumbnail ? `<img class="library-thumb" src="${sanitizeUrl(course.thumbnail)}" alt="${escapeHtml(course.title)} thumbnail">` : ''}
      <div class="library-card-top">
        <div>
          <h4>${escapeHtml(course.title)}</h4>
          <p>${escapeHtml(course.category)} | ${escapeHtml(course.level)}</p>
        </div>
        <span class="pill">${course.lessons?.length || 0} lessons</span>
      </div>
      <div class="library-tags">
        <span class="tag complete">${course.progressPercent || 0}% learner progress</span>
        <span class="tag pending">${course.enrollmentCount || 0} students</span>
      </div>
    </article>
  `).join('');

  els.adminAssignmentList.innerHTML = (state.dashboard.assignments || []).map((assignment) => `
    <article class="library-card">
      ${assignment.thumbnail ? `<img class="library-thumb" src="${sanitizeUrl(assignment.thumbnail)}" alt="${escapeHtml(assignment.title)} thumbnail">` : ''}
      <div class="library-card-top">
        <div>
          <h4>${escapeHtml(assignment.title)}</h4>
          <p>${escapeHtml(assignment.courseTitle)}</p>
        </div>
        <span class="pill">${assignment.dueDate ? escapeHtml(assignment.dueDate) : 'Open'}</span>
      </div>
      <p>${escapeHtml(assignment.description)}</p>
      ${assignment.fileDataUrl ? `<a class="btn btn-small btn-secondary" href="${sanitizeUrl(assignment.fileDataUrl)}" download="${escapeHtml(assignment.fileName || 'assignment-file')}">Download file</a>` : ''}
    </article>
  `).join('');
}

function renderAssignmentCourseSelect() {
  const options = (state.dashboard.courses || [])
    .map((course) => `<option value="${course.id}">${escapeHtml(course.title)}</option>`)
    .join('');
  els.assignmentCourseSelect.innerHTML = options;
}

function getDefaultCourseId() {
  const courses = state.dashboard?.courses || [];
  return courses.find((course) => course.isEnrolled)?.id || courses[0]?.id || null;
}

function getSelectedCourse() {
  const courses = state.dashboard?.courses || [];
  const selected = courses.find((course) => course.id === state.selectedCourseId);
  if (selected) return selected;
  const fallback = courses.find((course) => course.isEnrolled) || courses[0] || null;
  if (fallback) {
    state.selectedCourseId = fallback.id;
  }
  return fallback;
}

function setCompleteButtonState(enabled) {
  els.completeLessonBtn.disabled = !enabled;
  els.completeLessonBtn.textContent = enabled ? 'Mark complete' : 'Lesson completed';
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  await submitAuth('/api/login', {
    email: form.get('email'),
    password: form.get('password')
  }, 'Logged in successfully.');
}

async function handleRegister(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  await submitAuth('/api/register', {
    name: form.get('name'),
    email: form.get('email'),
    password: form.get('password')
  }, 'Student account created.');
}

async function submitAuth(url, payload, successMessage) {
  try {
    await api(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    state.selectedCourseId = null;
    state.selectedLessonId = null;
    await loadSession();
    toast(successMessage, 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await api('/api/logout', { method: 'POST' });
    state.session = null;
    state.dashboard = null;
    state.selectedCourseId = null;
    state.selectedLessonId = null;
    renderGuest();
    toast('You have been signed out.', 'info');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleCreateCourse(event) {
  event.preventDefault();
  try {
    const form = new FormData(event.target);
    const lessons = collectLessonRows();
    const thumbnail = await fileToDataUrl(form.get('thumbnail'));
    const body = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      level: form.get('level'),
      thumbnail,
      lessons
    };
    await api('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    event.target.reset();
    clearLessonBuilder();
    addLessonBuilderRow();
    addLessonBuilderRow();
    toast('Course published.', 'success');
    await loadDashboard();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleCreateAssignment(event) {
  event.preventDefault();
  try {
    const form = new FormData(event.target);
    const thumbnail = await fileToDataUrl(form.get('thumbnail'));
    const file = form.get('file');
    const fileDataUrl = await fileToDataUrl(file);
    const body = {
      courseId: form.get('courseId'),
      title: form.get('title'),
      description: form.get('description'),
      dueDate: form.get('dueDate'),
      thumbnail,
      fileName: file && file.name ? file.name : '',
      fileDataUrl
    };
    await api('/api/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    event.target.reset();
    toast('Assignment published.', 'success');
    await loadDashboard();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function markLessonComplete() {
  const course = getSelectedCourse();
  const lessonId = state.selectedLessonId || course?.nextLesson?.id;
  if (!course || !lessonId) return;

  try {
    await api(`/api/courses/${course.id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ lessonId })
    });
    toast('Lesson progress saved.', 'success');
    await loadDashboard();
  } catch (error) {
    toast(error.message, 'error');
  }
}

function addLessonBuilderRow(data = {}) {
  const row = document.createElement('article');
  row.className = 'builder-item';
  row.innerHTML = `
    <div class="card-row">
      <h4>Lesson</h4>
      <button class="btn btn-small btn-secondary" type="button" data-remove-row>Remove</button>
    </div>
    <div class="two-up">
      <label>
        <span>Lesson title</span>
        <input type="text" name="lessonTitle" value="${escapeAttr(data.title || '')}" placeholder="Introduction" required>
      </label>
      <label>
        <span>YouTube link</span>
        <input type="url" name="lessonYoutube" value="${escapeAttr(data.youtubeUrl || '')}" placeholder="https://youtube.com/watch?v=..." required>
      </label>
    </div>
    <label>
      <span>Lesson notes</span>
      <textarea name="lessonNotes" rows="3" placeholder="Short lesson summary">${escapeHtml(data.notes || '')}</textarea>
    </label>
  `;

  row.querySelector('[data-remove-row]')?.addEventListener('click', () => {
    row.remove();
  });

  els.lessonBuilder.appendChild(row);
}

function clearLessonBuilder() {
  els.lessonBuilder.innerHTML = '';
}

function collectLessonRows() {
  return Array.from(els.lessonBuilder.querySelectorAll('.builder-item'))
    .map((row, index) => {
      const title = row.querySelector('[name="lessonTitle"]').value.trim();
      const youtubeUrl = row.querySelector('[name="lessonYoutube"]').value.trim();
      const notes = row.querySelector('[name="lessonNotes"]').value.trim();
      return { title, youtubeUrl, notes, order: index + 1 };
    })
    .filter((lesson) => lesson.title && lesson.youtubeUrl);
}

async function fileToDataUrl(file) {
  if (!file || typeof file === 'string') return typeof file === 'string' ? file : '';
  if (typeof file.size === 'number' && file.size === 0) return '';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function api(path, options = {}) {
  return fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'same-origin',
    ...options
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  });
}

function toast(title, type = 'info', body = '') {
  const node = document.createElement('article');
  node.className = `toast ${type}`;
  node.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    ${body ? `<p>${escapeHtml(body)}</p>` : ''}
  `;
  els.toastHost.appendChild(node);
  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(12px)';
    setTimeout(() => node.remove(), 180);
  }, 2600);
}

function chip(label) {
  return `<span class="stat-chip">${escapeHtml(label)}</span>`;
}

function emptyState(title, description) {
  return `
    <article class="library-card">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(description)}</p>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function sanitizeUrl(url) {
  return String(url || '').replaceAll('"', '%22');
}
