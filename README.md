# EduSphere

EduSphere is a full-stack education platform with role-based dashboards for students and admins.

## What is included

- Guest landing page
- Student registration with admission number, year of study, and semester
- Student dashboard with sidebar sections for overview, courses, progress, assignments, and exams
- Admin dashboard with student roster, student detail view, and content management
- Course creation with year/semester targeting and YouTube lesson embeds
- Assignment publishing with thumbnails and file uploads
- Exam publishing with year/semester targeting
- Local JSON persistence

## Run locally

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## Demo accounts

- Student: `student@edusphere.local`
- Student password: `Student123!`
- Admin: `admin@edusphere.local`
- Admin password: `Admin123!`

## Notes

- Students only see dashboard content after login.
- Admins can view all students and inspect an individual student’s details.
- Courses, assignments, and exams are filtered by year of study and semester.
- The local data file is generated automatically in `data/db.json` and ignored by git.

## Legacy pages

The original multimedia demo pages still exist in the repo:

- `audio-player.html`
- `video-player.html`
- `animations.html`
- `gallery.html`
