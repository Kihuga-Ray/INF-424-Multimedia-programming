const state = {
  session: null,
  dashboard: null,
  activeView: 'overview',
  selectedCourseId: null,
  selectedAssignmentId: null,
  selectedExamId: null,
  selectedStudentId: null,
  studentDetail: null
};

const els = {};

document.addEventListener('DOMContentLoaded', () => {
  bindElements();
  bindTheme();
  bindAuthTabs();
  bindSidebar();
  bindForms();
  bindButtons();
  populateAcademicSelects();
  restoreTheme();
  loadSession();
});

function bindElements() {
  const ids = [
    'themeToggle',
    'themeToggleDashboard',
    'logoutBtn',
    'accountBadge',
    'loginTab',
    'registerTab',
    'loginPanel',
    'registerPanel',
    'loginForm',
    'registerForm',
    'landingView',
    'dashboardShell',
    'studentsNavBtn',
    'sidebarRoleLabel',
    'sidebarStats',
    'dashboardEyebrow',
    'dashboardTitle',
    'dashboardSubtitle',
    'profileChip',
    'overviewPanel',
    'studentsPanel',
    'coursesPanel',
    'progressPanel',
    'assignmentsPanel',
    'examsPanel',
    'adminPanel',
    'summaryMetrics',
    'studentProfileForm',
    'studentList',
    'studentDetails',
    'courseList',
    'courseDetails',
    'progressList',
    'progressDetails',
    'assignmentList',
    'assignmentDetails',
    'examList',
    'examDetails',
    'createCourseForm',
    'createAssignmentForm',
    'createExamForm',
    'lessonBuilder',
    'addLessonBtn',
    'assignmentCourseSelect',
    'examCourseSelect',
    'toastHost'
  ];

  ids.forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindTheme() {
  els.themeToggle?.addEventListener('click', () => toggleTheme());
  els.themeToggleDashboard?.addEventListener('click', () => toggleTheme());
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  setTheme(current === 'light' ? 'dark' : 'light');
}

function restoreTheme() {
  setTheme(localStorage.getItem('edusphere-theme') || 'dark');
}

function setTheme(theme) {
  const darkIcon = 'Moon';
  const lightIcon = 'Sun';
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
    els.themeToggle.textContent = lightIcon;
    els.themeToggleDashboard.textContent = lightIcon;
  } else {
    document.documentElement.removeAttribute('data-theme');
    els.themeToggle.textContent = darkIcon;
    els.themeToggleDashboard.textContent = darkIcon;
  }
  localStorage.setItem('edusphere-theme', theme);
}

function bindAuthTabs() {
  els.loginTab?.addEventListener('click', () => showAuthMode('login'));
  els.registerTab?.addEventListener('click', () => showAuthMode('register'));
}

function showAuthMode(mode) {
  const loginActive = mode === 'login';
  els.loginTab.classList.toggle('active', loginActive);
  els.registerTab.classList.toggle('active', !loginActive);
  els.loginPanel.classList.toggle('hidden', !loginActive);
  els.registerPanel.classList.toggle('hidden', loginActive);
}

function bindSidebar() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => setActiveView(button.dataset.view));
  });
}

function bindForms() {
  els.loginForm?.addEventListener('submit', handleLogin);
  els.registerForm?.addEventListener('submit', handleRegister);
  els.studentProfileForm?.addEventListener('submit', handleSaveProfile);
  els.createCourseForm?.addEventListener('submit', handleCreateCourse);
  els.createAssignmentForm?.addEventListener('submit', handleCreateAssignment);
  els.createExamForm?.addEventListener('submit', handleCreateExam);
}

function bindButtons() {
  els.logoutBtn?.addEventListener('click', handleLogout);
  els.addLessonBtn?.addEventListener('click', () => addLessonBuilderRow());
}

function populateAcademicSelects() {
  const years = ['1', '2', '3', '4'];
  const semesters = ['1', '2'];
  document.querySelectorAll('select[name="yearOfStudy"]').forEach((select) => {
    select.innerHTML = `<option value="">Choose year</option>${years.map((year) => `<option value="${year}">Year ${year}</option>`).join('')}`;
  });
  document.querySelectorAll('select[name="semester"]').forEach((select) => {
    select.innerHTML = `<option value="">Choose semester</option>${semesters.map((semester) => `<option value="${semester}">Semester ${semester}</option>`).join('')}`;
  });
}

async function loadSession() {
  try {
    const response = await api('/api/session');
    state.session = response.user;
    if (state.session) {
      els.landingView.classList.add('hidden');
      els.dashboardShell.classList.remove('hidden');
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
  els.landingView.classList.remove('hidden');
  els.dashboardShell.classList.add('hidden');
  els.accountBadge.textContent = 'Guest mode';
  state.dashboard = null;
  state.studentDetail = null;
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  state.dashboard = data;
  state.selectedCourseId = state.selectedCourseId || getDefaultCourseId();
  state.selectedAssignmentId = state.selectedAssignmentId || (data.assignments?.[0]?.id || null);
  state.selectedExamId = state.selectedExamId || (data.exams?.[0]?.id || null);
  state.selectedStudentId = state.selectedStudentId || (data.students?.[0]?.id || null);
  if (state.session.role === 'admin') {
    await loadAdminStudentDetail(state.selectedStudentId);
  }
  renderDashboard();
}

function renderDashboard() {
  if (!state.dashboard || !state.session) return;

  const isAdmin = state.session.role === 'admin';
  els.accountBadge.textContent = `${state.session.name} | ${state.session.role}`;
  els.sidebarRoleLabel.textContent = isAdmin ? 'Admin dashboard' : 'Student dashboard';
  els.studentsNavBtn.classList.toggle('hidden', !isAdmin);
  els.adminPanel.classList.toggle('hidden', !isAdmin);
  els.profileChip.textContent = profileComplete(state.session.profile) ? 'Profile complete' : 'Profile incomplete';
  els.profileChip.className = `pill ${profileComplete(state.session.profile) ? 'pill-success' : 'pill-warning'}`;

  renderSidebarStats();
  renderSummaryMetrics();
  renderProfileForm();
  renderAcademicForms();
  renderCurrentView();
  renderAdminSection();
  applySectionVisibility();
}

function renderSidebarStats() {
  const isAdmin = state.session.role === 'admin';
  const metrics = state.dashboard.metrics || {};
  const chips = isAdmin
    ? [
        `${metrics.students || 0} students`,
        `${metrics.courses || 0} courses`,
        `${metrics.exams || 0} exams`
      ]
    : [
        `${metrics.courses || 0} courses`,
        `${metrics.assignments || 0} assignments`,
        `${metrics.exams || 0} exams`
      ];
  els.sidebarStats.innerHTML = chips.map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join('');
}

function renderSummaryMetrics() {
  const metrics = state.dashboard.metrics || {};
  const items = state.session.role === 'admin'
    ? [
        metricCard('Students', metrics.students || 0),
        metricCard('Courses', metrics.courses || 0),
        metricCard('Assignments', metrics.assignments || 0),
        metricCard('Exams', metrics.exams || 0)
      ]
    : [
        metricCard('Courses', metrics.courses || 0),
        metricCard('Assignments', metrics.assignments || 0),
        metricCard('Exams', metrics.exams || 0),
        metricCard('Progress', `${metrics.progress || 0}%`)
      ];
  els.summaryMetrics.innerHTML = items.join('');
}

function renderProfileForm() {
  if (!state.session) return;
  const profile = state.session.profile || {};
  els.studentProfileForm.elements.admissionNumber.value = profile.admissionNumber || '';
  els.studentProfileForm.elements.yearOfStudy.value = String(profile.yearOfStudy || '1');
  els.studentProfileForm.elements.semester.value = String(profile.semester || '1');
  els.studentProfileForm.elements.email.value = state.session.email || '';
}

function renderAcademicForms() {
  const courses = state.dashboard.courses || [];
  const options = courses.map((course) => `<option value="${course.id}">${escapeHtml(course.title)}</option>`).join('');
  if (els.assignmentCourseSelect) els.assignmentCourseSelect.innerHTML = options;
  if (els.examCourseSelect) els.examCourseSelect.innerHTML = options;
}

function renderCurrentView() {
  const view = state.activeView;
  const isAdmin = state.session.role === 'admin';

  const titles = {
    overview: ['Overview', 'A quick look at your learning state and profile.'],
    courses: ['Courses', 'Explore and enroll in courses that match your year and semester.'],
    progress: ['Progress', 'Track completion across your enrolled courses.'],
    assignments: ['Assignments', 'Work posted by the admin for your cohort.'],
    exams: ['Exams', 'Upcoming and published exam items.'],
    students: ['Students', 'Admin view of all student records and details.']
  };

  const [title, subtitle] = titles[view] || titles.overview;
  els.dashboardTitle.textContent = title;
  els.dashboardSubtitle.textContent = subtitle;
  els.dashboardEyebrow.textContent = isAdmin ? 'Admin center' : 'Student center';

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  const panels = {
    overview: els.overviewPanel,
    courses: els.coursesPanel,
    progress: els.progressPanel,
    assignments: els.assignmentsPanel,
    exams: els.examsPanel,
    students: els.studentsPanel
  };

  Object.entries(panels).forEach(([key, panel]) => {
    panel.classList.toggle('hidden', key !== view);
  });

  renderOverviewPanel();
  renderCoursesPanel();
  renderProgressPanel();
  renderAssignmentsPanel();
  renderExamsPanel();
  if (isAdmin) {
    renderStudentsPanel();
  }
}

function renderOverviewPanel() {
  const isAdmin = state.session.role === 'admin';
  if (isAdmin) {
    els.summaryMetrics.innerHTML = [
      metricCard('All students', state.dashboard.students?.length || 0),
      metricCard('Published courses', state.dashboard.courses?.length || 0),
      metricCard('Assignments', state.dashboard.assignments?.length || 0),
      metricCard('Exams', state.dashboard.exams?.length || 0)
    ].join('');
  } else {
    const profile = state.session.profile || {};
    els.summaryMetrics.innerHTML = [
      metricCard('Admission', profile.admissionNumber || 'N/A'),
      metricCard('Year', `Year ${profile.yearOfStudy || '1'}`),
      metricCard('Semester', `Semester ${profile.semester || '1'}`),
      metricCard('Progress', `${state.dashboard.metrics?.progress || 0}%`)
    ].join('');
  }
}

function renderStudentsPanel() {
  const students = state.dashboard.students || [];
  els.studentList.innerHTML = students.length
    ? students.map((student) => `
        <button class="list-item ${student.id === state.selectedStudentId ? 'active' : ''}" type="button" data-student-id="${student.id}">
          <div>
            <strong>${escapeHtml(student.name)}</strong>
            <span>${escapeHtml(student.admissionNumber || 'No admission number')}</span>
          </div>
          <small>${escapeHtml(`Year ${student.yearOfStudy} / Semester ${student.semester}`)}</small>
        </button>
      `).join('')
    : emptyBlock('No students', 'Student registrations will appear here.');

  els.studentList.querySelectorAll('[data-student-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.selectedStudentId = button.dataset.studentId;
      await loadAdminStudentDetail(state.selectedStudentId);
      renderDashboard();
      setActiveView('students');
    });
  });

  if (!state.studentDetail) {
    els.studentDetails.innerHTML = emptyBlock('Select a student', 'Click a student to see profile, courses, assignments, and exams.');
    return;
  }

  const detail = state.studentDetail;
  els.studentDetails.innerHTML = `
    <div class="details-grid">
      <div class="detail-card">
        <span class="eyebrow">Profile</span>
        <h4>${escapeHtml(detail.student.name)}</h4>
        <p>${escapeHtml(detail.student.email)}</p>
        <p>${escapeHtml(detail.student.profile?.admissionNumber || '')}</p>
        <p>${escapeHtml(`Year ${detail.student.profile?.yearOfStudy || '1'} / Semester ${detail.student.profile?.semester || '1'}`)}</p>
      </div>
      <div class="detail-card">
        <span class="eyebrow">Progress</span>
        <h4>${escapeHtml(String(detail.progress || 0))}%</h4>
        <p>${escapeHtml(`${detail.courses.length} enrolled courses`)}</p>
      </div>
      <div class="detail-card detail-wide">
        <span class="eyebrow">Courses</span>
        <div class="mini-list">
          ${detail.courses.map((course) => `<span class="pill">${escapeHtml(course.title)}</span>`).join('')}
        </div>
      </div>
      <div class="detail-card detail-wide">
        <span class="eyebrow">Academic scope</span>
        <p>${escapeHtml(`Assignments: ${detail.assignments.length}`)}</p>
        <p>${escapeHtml(`Exams: ${detail.exams.length}`)}</p>
      </div>
    </div>
  `;
}

function renderCoursesPanel() {
  const courses = state.dashboard.courses || [];
  const profile = state.session.profile || {};
  const visibleCourses = state.session.role === 'admin'
    ? courses
    : courses.filter((course) => courseMatchesProfile(course, profile));

  els.courseList.innerHTML = visibleCourses.length
    ? visibleCourses.map((course) => `
        <button class="list-item ${course.id === state.selectedCourseId ? 'active' : ''}" type="button" data-course-id="${course.id}">
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <span>${escapeHtml(course.category)} | ${escapeHtml(course.level)}</span>
          </div>
          <small>${escapeHtml(`Year ${course.yearOfStudy} / Semester ${course.semester}`)}</small>
        </button>
      `).join('')
    : emptyBlock('No courses', 'No courses match your profile yet.');

  els.courseList.querySelectorAll('[data-course-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCourseId = button.dataset.courseId;
      renderCoursesPanel();
      renderCourseDetails();
    });
  });

  renderCourseDetails();
}

function renderCourseDetails() {
  const course = (state.dashboard.courses || []).find((entry) => entry.id === state.selectedCourseId) || state.dashboard.courses?.[0] || null;
  if (!course) {
    els.courseDetails.innerHTML = emptyBlock('No course selected', 'Pick a course to view details.');
    return;
  }

  const canEnroll = state.session.role === 'student' && !course.isEnrolled;
  const buttonHtml = canEnroll
    ? `<button class="btn btn-full" type="button" data-enroll-course="${course.id}">Enroll course</button>`
    : '';

  els.courseDetails.innerHTML = `
    <div class="details-grid">
      <div class="detail-card detail-wide">
        ${course.thumbnail ? `<img class="thumb" src="${sanitizeUrl(course.thumbnail)}" alt="${escapeHtml(course.title)} thumbnail">` : ''}
        <span class="eyebrow">${escapeHtml(course.category)}</span>
        <h4>${escapeHtml(course.title)}</h4>
        <p>${escapeHtml(course.description)}</p>
        <p>${escapeHtml(`Year ${course.yearOfStudy} / Semester ${course.semester}`)}</p>
      </div>
      <div class="detail-card">
        <span class="eyebrow">Lessons</span>
        <h4>${escapeHtml(String(course.totalLessons || 0))}</h4>
        <p>${escapeHtml(`${course.enrollmentCount || 0} students`)}</p>
      </div>
      <div class="detail-card detail-wide">
        ${buttonHtml}
      </div>
    </div>
  `;

  els.courseDetails.querySelectorAll('[data-enroll-course]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await api(`/api/courses/${button.dataset.enrollCourse}/enroll`, { method: 'POST' });
        toast('Course added to your dashboard.', 'success');
        await loadDashboard();
      } catch (error) {
        toast(error.message, 'error');
      }
    });
  });
}

function renderProgressPanel() {
  if (state.session.role === 'admin') {
    const rows = (state.dashboard.students || []).map((student) => `
      <button class="list-item ${student.id === state.selectedStudentId ? 'active' : ''}" type="button" data-student-id-progress="${student.id}">
        <div>
          <strong>${escapeHtml(student.name)}</strong>
          <span>${escapeHtml(student.admissionNumber || '')}</span>
        </div>
        <small>${escapeHtml(`${student.progress}%`)}</small>
      </button>
    `);
    els.progressList.innerHTML = rows.join('') || emptyBlock('No data', 'Student progress will appear here.');
    els.progressDetails.innerHTML = state.studentDetail
      ? `
        <div class="detail-card detail-wide">
          <span class="eyebrow">Student progress</span>
          <h4>${escapeHtml(state.studentDetail.student.name)}</h4>
          <div class="progress-track"><div class="progress-fill" style="width:${state.studentDetail.progress}%"></div></div>
          <p>${escapeHtml(`${state.studentDetail.progress}% complete across enrolled courses`)}</p>
        </div>
      `
      : emptyBlock('Select a student', 'Choose a student to inspect their progress.');
    els.progressList.querySelectorAll('[data-student-id-progress]').forEach((button) => {
      button.addEventListener('click', async () => {
        state.selectedStudentId = button.dataset.studentIdProgress;
        await loadAdminStudentDetail(state.selectedStudentId);
        renderDashboard();
        setActiveView('students');
      });
    });
    return;
  }

  const enrolledCourses = (state.dashboard.courses || []).filter((course) => course.isEnrolled);
  els.progressList.innerHTML = enrolledCourses.length
    ? enrolledCourses.map((course) => `
        <button class="list-item ${course.id === state.selectedCourseId ? 'active' : ''}" type="button" data-progress-course="${course.id}">
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <span>${escapeHtml(`${course.completedCount}/${course.totalLessons} lessons`)}</span>
          </div>
          <small>${escapeHtml(`${course.progressPercent}%`)}</small>
        </button>
      `).join('')
    : emptyBlock('No progress yet', 'Enroll in a course to begin tracking progress.');

  els.progressDetails.innerHTML = state.selectedCourseId
    ? renderProgressDetails()
    : emptyBlock('Choose a course', 'Open a course to see lesson-level progress.');

  els.progressList.querySelectorAll('[data-progress-course]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCourseId = button.dataset.progressCourse;
      renderProgressPanel();
    });
  });
}

function renderProgressDetails() {
  const course = (state.dashboard.courses || []).find((entry) => entry.id === state.selectedCourseId);
  if (!course) return emptyBlock('No course selected', 'Pick a course to inspect progress.');
  return `
    <div class="details-grid">
      <div class="detail-card detail-wide">
        <span class="eyebrow">Completion</span>
        <h4>${escapeHtml(course.title)}</h4>
        <div class="progress-track"><div class="progress-fill" style="width:${course.progressPercent}%"></div></div>
        <p>${escapeHtml(`${course.completedCount} of ${course.totalLessons} lessons completed`)}</p>
      </div>
      <div class="detail-card detail-wide">
        <span class="eyebrow">Next lesson</span>
        <p>${escapeHtml(course.nextLesson?.title || 'All caught up')}</p>
      </div>
    </div>
  `;
}

function renderAssignmentsPanel() {
  const assignments = state.dashboard.assignments || [];
  els.assignmentList.innerHTML = assignments.length
    ? assignments.map((assignment) => `
        <button class="list-item ${assignment.id === state.selectedAssignmentId ? 'active' : ''}" type="button" data-assignment-id="${assignment.id}">
          <div>
            <strong>${escapeHtml(assignment.title)}</strong>
            <span>${escapeHtml(assignment.courseTitle)}</span>
          </div>
          <small>${escapeHtml(`Year ${assignment.yearOfStudy} / Semester ${assignment.semester}`)}</small>
        </button>
      `).join('')
    : emptyBlock('No assignments', 'Assignments published by the admin will appear here.');

  els.assignmentList.querySelectorAll('[data-assignment-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedAssignmentId = button.dataset.assignmentId;
      renderAssignmentsPanel();
    });
  });

  const assignment = assignments.find((entry) => entry.id === state.selectedAssignmentId) || assignments[0] || null;
  if (!assignment) {
    els.assignmentDetails.innerHTML = emptyBlock('No assignment selected', 'Pick one to see details.');
    return;
  }

  els.assignmentDetails.innerHTML = `
    <div class="details-grid">
      <div class="detail-card detail-wide">
        ${assignment.thumbnail ? `<img class="thumb" src="${sanitizeUrl(assignment.thumbnail)}" alt="${escapeHtml(assignment.title)} thumbnail">` : ''}
        <span class="eyebrow">${escapeHtml(assignment.courseTitle)}</span>
        <h4>${escapeHtml(assignment.title)}</h4>
        <p>${escapeHtml(assignment.description)}</p>
        <p>${escapeHtml(`Due ${assignment.dueDate || 'TBA'}`)}</p>
      </div>
      <div class="detail-card detail-wide">
        ${assignment.fileDataUrl ? `<a class="btn btn-full" href="${sanitizeUrl(assignment.fileDataUrl)}" download="${escapeHtml(assignment.fileName || 'assignment-file')}">Download file</a>` : '<p>No file attached.</p>'}
      </div>
    </div>
  `;
}

function renderExamsPanel() {
  const exams = state.dashboard.exams || [];
  els.examList.innerHTML = exams.length
    ? exams.map((exam) => `
        <button class="list-item ${exam.id === state.selectedExamId ? 'active' : ''}" type="button" data-exam-id="${exam.id}">
          <div>
            <strong>${escapeHtml(exam.title)}</strong>
            <span>${escapeHtml(exam.courseTitle)}</span>
          </div>
          <small>${escapeHtml(`Year ${exam.yearOfStudy} / Semester ${exam.semester}`)}</small>
        </button>
      `).join('')
    : emptyBlock('No exams', 'Published exams will appear here.');

  els.examList.querySelectorAll('[data-exam-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedExamId = button.dataset.examId;
      renderExamsPanel();
    });
  });

  const exam = exams.find((entry) => entry.id === state.selectedExamId) || exams[0] || null;
  if (!exam) {
    els.examDetails.innerHTML = emptyBlock('No exam selected', 'Pick an exam to see details.');
    return;
  }

  els.examDetails.innerHTML = `
    <div class="details-grid">
      <div class="detail-card detail-wide">
        ${exam.thumbnail ? `<img class="thumb" src="${sanitizeUrl(exam.thumbnail)}" alt="${escapeHtml(exam.title)} thumbnail">` : ''}
        <span class="eyebrow">${escapeHtml(exam.courseTitle)}</span>
        <h4>${escapeHtml(exam.title)}</h4>
        <p>${escapeHtml(exam.description)}</p>
        <p>${escapeHtml(`Exam date ${exam.examDate || 'TBA'}`)}</p>
      </div>
    </div>
  `;
}

function renderAdminSection() {
  if (state.session.role !== 'admin') return;
  if (!els.lessonBuilder.children.length) {
    addLessonBuilderRow();
    addLessonBuilderRow();
  }
}

function setActiveView(view) {
  state.activeView = view;
  renderCurrentView();
  if (view === 'overview') {
    renderDashboard();
  }
}

function applySectionVisibility() {
  const visible = {
    overview: true,
    students: state.session.role === 'admin',
    courses: true,
    progress: true,
    assignments: true,
    exams: true
  };
  Object.entries(visible).forEach(([view, allowed]) => {
    const button = document.querySelector(`[data-view="${view}"]`);
    if (button) button.classList.toggle('hidden', !allowed);
  });
}

function profileComplete(profile) {
  return Boolean(profile?.admissionNumber && profile?.yearOfStudy && profile?.semester);
}

function getDefaultCourseId() {
  const courses = state.dashboard?.courses || [];
  return courses[0]?.id || null;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password')
      })
    });
    state.selectedCourseId = null;
    state.selectedAssignmentId = null;
    state.selectedExamId = null;
    await loadSession();
    toast('Logged in successfully.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        admissionNumber: form.get('admissionNumber'),
        yearOfStudy: form.get('yearOfStudy'),
        semester: form.get('semester')
      })
    });
    await loadSession();
    toast('Student account created.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleSaveProfile(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const response = await api('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        admissionNumber: form.get('admissionNumber'),
        yearOfStudy: form.get('yearOfStudy'),
        semester: form.get('semester')
      })
    });
    state.session = response.user;
    await loadDashboard();
    toast('Profile saved.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await api('/api/logout', { method: 'POST' });
    state.session = null;
    state.dashboard = null;
    state.activeView = 'overview';
    state.studentDetail = null;
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
    const body = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      level: 'Core',
      yearOfStudy: form.get('yearOfStudy'),
      semester: form.get('semester'),
      thumbnail: await fileToDataUrl(form.get('thumbnail')),
      lessons: collectLessonRows()
    };
    await api('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    event.target.reset();
    clearLessonBuilder();
    addLessonBuilderRow();
    addLessonBuilderRow();
    await loadDashboard();
    toast('Course published.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleCreateAssignment(event) {
  event.preventDefault();
  try {
    const form = new FormData(event.target);
    const body = {
      courseId: form.get('courseId'),
      title: form.get('title'),
      description: form.get('description'),
      dueDate: form.get('dueDate'),
      yearOfStudy: form.get('yearOfStudy'),
      semester: form.get('semester'),
      thumbnail: await fileToDataUrl(form.get('thumbnail')),
      fileName: getFileName(form.get('file')),
      fileDataUrl: await fileToDataUrl(form.get('file'))
    };
    await api('/api/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    event.target.reset();
    await loadDashboard();
    toast('Assignment published.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function handleCreateExam(event) {
  event.preventDefault();
  try {
    const form = new FormData(event.target);
    const body = {
      courseId: form.get('courseId'),
      title: form.get('title'),
      description: form.get('description'),
      examDate: form.get('examDate'),
      yearOfStudy: form.get('yearOfStudy'),
      semester: form.get('semester'),
      thumbnail: await fileToDataUrl(form.get('thumbnail'))
    };
    await api('/api/admin/exams', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    event.target.reset();
    await loadDashboard();
    toast('Exam published.', 'success');
  } catch (error) {
    toast(error.message, 'error');
  }
}

function addLessonBuilderRow(data = {}) {
  const row = document.createElement('article');
  row.className = 'builder-item';
  row.innerHTML = `
    <div class="row-between">
      <h4>Lesson</h4>
      <button class="btn btn-secondary btn-small" type="button" data-remove-row>Remove</button>
    </div>
    <div class="two-up">
      <label>
        <span>Lesson title</span>
        <input type="text" name="lessonTitle" value="${escapeAttr(data.title || '')}" required>
      </label>
      <label>
        <span>YouTube link</span>
        <input type="url" name="lessonYoutube" value="${escapeAttr(data.youtubeUrl || '')}" required>
      </label>
    </div>
    <label>
      <span>Lesson notes</span>
      <textarea name="lessonNotes" rows="3">${escapeHtml(data.notes || '')}</textarea>
    </label>
  `;

  row.querySelector('[data-remove-row]').addEventListener('click', () => row.remove());
  els.lessonBuilder.appendChild(row);
}

function clearLessonBuilder() {
  els.lessonBuilder.innerHTML = '';
}

function collectLessonRows() {
  return Array.from(els.lessonBuilder.querySelectorAll('.builder-item'))
    .map((row, index) => ({
      title: row.querySelector('[name="lessonTitle"]').value.trim(),
      youtubeUrl: row.querySelector('[name="lessonYoutube"]').value.trim(),
      notes: row.querySelector('[name="lessonNotes"]').value.trim(),
      order: index + 1
    }))
    .filter((lesson) => lesson.title && lesson.youtubeUrl);
}

function getFileName(file) {
  if (!file || typeof file === 'string') return '';
  return file.name || '';
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

function courseMatchesProfile(course, profile) {
  if (!profile) return true;
  const year = String(profile.yearOfStudy || '');
  const semester = String(profile.semester || '');
  const courseYear = String(course.yearOfStudy || 'all');
  const courseSemester = String(course.semester || 'all');
  const yearOk = courseYear === 'all' || courseYear === year;
  const semesterOk = courseSemester === 'all' || courseSemester === semester;
  return yearOk && semesterOk;
}

async function loadAdminStudentDetail(studentId) {
  if (!studentId || state.session.role !== 'admin') return;
  state.studentDetail = await api(`/api/admin/students/${studentId}`);
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
  node.innerHTML = `<strong>${escapeHtml(title)}</strong>${body ? `<p>${escapeHtml(body)}</p>` : ''}`;
  els.toastHost.appendChild(node);
  setTimeout(() => {
    node.remove();
  }, 2600);
}

function metricCard(label, value) {
  return `
    <article class="metric-card metric-card-small">
      <span class="metric-value">${escapeHtml(String(value))}</span>
      <span class="metric-label">${escapeHtml(label)}</span>
    </article>
  `;
}

function emptyBlock(title, description) {
  return `
    <article class="empty-block">
      <strong>${escapeHtml(title)}</strong>
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
