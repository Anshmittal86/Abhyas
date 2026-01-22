# Student Dashboard

## Authentication APIs

- ✅ `POST /api/auth/admin-login` - Admin login
- ✅ `POST /api/auth/student-login` - Student login
- ✅ `POST /api/auth/logout` - Logout user
- ✅ `POST /api/auth/refresh-token` - Refresh access token
- ✅ `GET /api/healthcheck` - Health check

## Admin APIs - Course Management

- ✅ `POST /api/admin/course` - Create course
- ✅ `GET /api/admin/course` - List all courses -
- ✅ `GET /api/admin/course/:id` - Get course details -
- ✅ `PUT /api/admin/course/:id` - Update course -
- ✅ `DELETE /api/admin/course/:id` - Delete course -

## Admin APIs - Chapter Management

- ✅ `POST /api/admin/chapter` - Create chapter
- ✅ `GET /api/admin/chapter` - List all chapters -
- ✅ `GET /api/admin/chapter/:id` - Get chapter details
- ✅ `PUT /api/admin/chapter/:id` - Update chapter
- ✅ `DELETE /api/admin/chapter/:id` - Delete chapter

## Admin APIs - Test Management

- ✅ `POST /api/admin/test` - Create test
- ✅ `GET /api/admin/test` - List all tests
- ✅ `GET /api/admin/test/:id` - Get test details
- ✅ `PUT /api/admin/test/:id` - Update test
- ✅ `DELETE /api/admin/test/:id` - Delete test

## Admin APIs - Question Management

- ✅ `POST /api/admin/question` - Create question
- ✅ `GET /api/admin/question` - List all questions
- ✅ `GET /api/admin/question/:id` - Get question details
- ✅ `PUT /api/admin/question/:id` - Update question
- ✅ `DELETE /api/admin/question/:id` - Delete question

## Admin APIs - Student Management

- ✅ `POST /api/admin/student` - Create student
- ✅ `GET /api/admin/student` - List all students
- ✅ `GET /api/admin/student/:id` - Get student details
- ✅ `PUT /api/admin/student/:id` - Update student
- ✅ `DELETE /api/admin/student/:id` - Delete student
- ✅ `POST /api/admin/student/:id/enroll` - Enroll student in course
- ✅ `DELETE /api/admin/student/:id/unenroll/:courseId` - Remove student from course

## Admin APIs - Test Attempts & Results

- ⬜ `GET /api/admin/test-attempts` - List all test attempts
- ⬜ `GET /api/admin/test-attempts/:id` - Get test attempt details
- ⬜ `GET /api/admin/students/:studentId/results` - Get student results
- ⬜ `DELETE /api/admin/test-attempts/:id` - Delete test attempt

## Admin APIs - Analytics & Reports

- ⬜ `GET /api/admin/dashboard` - Admin dashboard statistics
- ⬜ `GET /api/admin/reports/course-performance` - Course performance report
- ⬜ `GET /api/admin/reports/student-performance` - Student performance report
- ⬜ `GET /api/admin/reports/test-analytics` - Test analytics

## Admin APIs - Admin Logs & Audit

- ⬜ `GET /api/admin/logs` - View admin activity logs
- ⬜ `GET /api/admin/audit-trail` - View system audit trail

## Admin APIs - Bulk Operations

- ⬜ `POST /api/admin/students/bulk-create` - Bulk create students
- ⬜ `POST /api/admin/students/:courseId/bulk-enroll` - Bulk enroll students

## Admin APIs - Account Management

- ⬜ `GET /api/admin/profile` - Get admin profile
- ⬜ `PUT /api/admin/profile` - Update admin profile
- ⬜ `PUT /api/admin/change-password` - Change password

## Student APIs - Dashboard & Courses

- ✅ `GET /api/student/dashboard` - Get student dashboard
- ✅ `GET /api/student/courses` - List enrolled courses
- ✅ `GET /api/student/courses/:courseId/chapters` - List course chapters

## Student APIs - Tests & Attempts

- ✅ `POST /api/student/tests/:testId/start` - Start test attempt
- ✅ `POST /api/student/attempt/:attemptId/answer` - Submit test answer

## Student APIs - Results

- ⬜ `GET /api/student/results` - Get all test results
- ⬜ `GET /api/student/results/:testId` - Get specific test result

## Legend

- ✅ API Created
- ⬜ Pending (Not yet created)
