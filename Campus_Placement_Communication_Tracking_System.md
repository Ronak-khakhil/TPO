# Campus Placement Communication & Tracking System
## Detailed Minor Project Documentation

**Project Type:** Web-Based Application  
**Recommended Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
**Prepared for:** College Minor Project  
**Version:** 1.0  
**Date:** October 2026

---

## 1. Project Overview

The **Campus Placement Communication & Tracking System** is a centralized web-based platform designed to connect companies, the Training and Placement Officer (TPO), and students through one portal.

Companies can submit campus recruitment requests, share job descriptions, specify eligibility criteria, and suggest recruitment dates. The TPO reviews these requests and approves or rejects them. Once approved, the placement drive is published to the student portal. Students can view company information, check eligibility, submit applications, and track their application status. Companies and authorized TPO staff can review applications, publish shortlists, update recruitment-round outcomes, and publish the final selected-student list.

The system also maintains placement-drive history, upcoming company schedules, and college placement statistics.

### 1.1 Problem Statement

Campus placement information is often shared through multiple channels such as emails, messaging groups, spreadsheets, notice boards, and verbal announcements. This can cause missed deadlines, duplicate records, difficulty tracking student applications, delayed result updates, and extra administrative work for the TPO.

A centralized placement portal can organize company communication, approvals, applications, selection stages, notifications, and reports in one place.

### 1.2 Proposed Solution

Develop a role-based portal with separate dashboards for:
- **Company/Recruiter:** submits drives, sets criteria, reviews applicants, manages shortlists and results.
- **TPO/Admin:** approves company requests, manages access, publishes drives, monitors the process, and views reports.
- **Student:** views drives, checks eligibility, applies, and tracks application status.

### 1.3 Objectives

1. Centralize communication between companies, TPO staff, and students.
2. Make company visits and recruitment schedules easy to find.
3. Record and publish eligibility criteria clearly.
4. Simplify student applications and reduce manual data entry.
5. Support shortlisting and recruitment-stage updates.
6. Maintain accurate final placement records.
7. Provide college-level and branch-wise placement statistics.
8. Use role-based permissions to protect student and company information.

### 1.4 Scope

The first version focuses on the campus recruitment process, from a company’s visit request through final selection and reporting. It is a placement communication and tracking system; it does not itself conduct online examinations, interviews, or make hiring decisions. Those stages can be recorded and managed in the portal.

---

## 2. Stakeholders and User Roles

### 2.1 TPO / Administrator

The TPO is responsible for managing the college’s placement activity.

**Permissions and tasks**
- Sign in through a protected administrator account.
- Review company registration details and recruitment requests.
- Approve, reject, or request changes to a drive.
- Verify job information, dates, and eligibility criteria.
- Publish approved drives to the student portal.
- Manage student accounts and academic profile records.
- View applications and recruitment-stage progress.
- Publish or authorize shortlist and final results.
- Create reports and export placement data.
- Review audit history for important actions.

### 2.2 Company / Recruiter

A company user manages only that company’s profile and recruitment drives.

**Permissions and tasks**
- Register or receive an account approved by the TPO.
- Maintain company profile information.
- Submit a campus visit or recruitment request.
- Add job role, job description, location, package details, dates, and eligibility criteria.
- View applications for its own approved drives.
- Shortlist candidates and update recruitment-round outcomes.
- Publish the final selection list, subject to the college’s approval policy.
- View relevant applicant information only when authorized.

### 2.3 Student

A student can access published drives and manage their own applications.

**Permissions and tasks**
- Sign in using a college-approved account.
- View and update permitted profile information.
- Maintain academic information such as branch, CGPA, and backlog status.
- View upcoming, open, and completed placement drives.
- See eligibility status and, where possible, the reason for ineligibility.
- Apply to eligible drives before the deadline.
- View submitted applications and their status.
- View published shortlists and final results.
- Receive portal notifications about deadlines and status changes.

### 2.4 Suggested Role-Permission Matrix

| Action | TPO/Admin | Company | Student |
|---|---|---|---|
| Submit a company visit request | Optional | Yes | No |
| Approve a recruitment drive | Yes | No | No |
| Publish an approved drive | Yes | No, unless delegated | No |
| View all college drives | Yes | Published/relevant drives | Published/relevant drives |
| View applications | College-level access | Own company’s drives | Own applications |
| Update shortlist | Authorize/manage | Own company’s drives | No |
| Publish final result | Authorize/manage | Submit result | No |
| View placement reports | Yes | Own drive summaries | Public summaries, if enabled |
| Manage user access | Yes | No | No |

*The exact permission policy should be agreed with the college. Company access must not expose unrelated companies’ applications or unrestricted college records.*

---

## 3. End-to-End Workflow

### Step 1: Company Registration and Recruitment Request

The company registers or receives an account from the TPO. An authorized recruiter submits a placement-drive request containing:
- Company name and contact details
- Job title and description
- Job location and work mode
- Compensation/package details, if available
- Eligible branches and degree requirements
- Minimum CGPA/percentage
- Backlog or arrears policy
- Graduation year and other criteria
- Application opening and closing dates
- Proposed pre-placement talk, test, and interview dates
- Number of openings, if known
- Required documents or application fields

The company saves the request in **Pending TPO Approval** status.

### Step 2: TPO Review and Approval

The TPO checks the company information, role details, dates, and criteria. The TPO can:
- Approve the request
- Reject the request with a reason
- Return it for correction

Only approved drives should become visible as official student notifications. Approval status and timestamps should be recorded.

### Step 3: Publish Notification

After approval, the drive appears on the student dashboard. The notification should contain:
- Company and job-role information
- Eligibility requirements
- Package details, where disclosed
- Important dates and deadlines
- Selection process and rounds
- Application button and current drive status

Students should be able to search and filter drives by company, branch, job role, date, and status.

### Step 4: Student Eligibility Check

The system compares a student’s recorded academic profile against the company’s configured rules.

Example criteria:
- Branch must be CSE, IT, or another listed branch.
- CGPA must be at least 7.00.
- Active backlogs must be zero.
- Graduation year must match the drive’s target batch.

The system should display **Eligible**, **Not Eligible**, or **Needs TPO Verification**. Where possible, it should show a clear reason such as “Minimum CGPA is 7.00; recorded CGPA is 6.88.”

Eligibility automation depends on accurate student records and clearly defined company rules. Ambiguous rules, missing data, or special cases must be sent for manual review rather than silently rejected.

### Step 5: Application Submission

Eligible students fill in any additional required fields and submit the form before the deadline. The system:
- Checks that required fields are complete.
- Prevents duplicate applications to the same drive.
- Stores a timestamp for submission.
- Shows an application confirmation.
- Changes the application status to **Applied**.

If profile data is used for eligibility, students should be able to request corrections through the college’s approved process. Submitted applications should not be silently altered.

### Step 6: Application Review and Shortlisting

The company reviews the applications for its own drive. The company or authorized TPO staff can:
- View applicant details permitted by the college.
- Filter applications.
- Mark candidates as shortlisted or not shortlisted.
- Record the recruitment round.
- Upload or publish a shortlist.

Suggested statuses:
- Applied
- Under Review
- Shortlisted for Test
- Test Completed
- Shortlisted for Interview
- Interview Completed
- On Hold
- Not Selected
- Selected
- Offer Accepted
- Offer Declined
- Withdrawn

The project should define a simple, consistent set of statuses and use them throughout the UI and database.

### Step 7: Recruitment Rounds

For each drive, authorized users can record rounds such as:
1. Pre-placement talk
2. Aptitude or technical test
3. Group discussion, if applicable
4. Technical interview
5. HR interview
6. Final decision

The portal records outcomes; it does not need to conduct the examination or interview in the initial version.

### Step 8: Final Selection List

After the company completes its process, an authorized recruiter submits the final selected-student list. The TPO may verify and publish it according to college policy.

The portal records:
- Student and company
- Drive and job role
- Final result
- Offer/package information, if available
- Result publication date
- Offer acceptance status, if tracked

Only authorized users should be able to publish final outcomes. Students should see only the results that the college/company has officially released.

### Step 9: Placement Statistics and Reports

The TPO dashboard can show:
- Number of companies registered
- Upcoming, active, and completed drives
- Total applications
- Number of shortlisted candidates
- Number of students receiving offers
- Unique students placed
- Branch-wise placement counts
- Company-wise results
- Package summaries, where reliable data is available
- Drive history by academic year

**Important reporting distinction:** one student may receive more than one offer. The system should report both total offers and unique students placed so that placement counts are not misleading.

A common placement-rate formula is:

`Placement Rate (%) = (Unique eligible students placed / Total eligible graduating students) × 100`

The college should define what “eligible graduating students” means and use the same definition across reports. If the denominator is unavailable, label the metric clearly rather than presenting an unsupported percentage.

---

## 4. Functional Requirements

### FR-01: Authentication
The system shall allow authorized users to sign in and sign out securely.

### FR-02: Role-Based Access
The system shall provide separate permissions for TPO/Admin, Company, and Student roles.

### FR-03: Company Profile
The system shall allow an authorized company user to submit and maintain company details, subject to verification.

### FR-04: Drive Request
The system shall allow a company to create a recruitment-drive request with job details, dates, and eligibility rules.

### FR-05: Approval Workflow
The system shall allow the TPO to approve, reject, or return a request for changes.

### FR-06: Drive Publication
Only approved drives shall be published as official student-facing drives.

### FR-07: Notifications
The system shall display relevant notifications for new drives, deadlines, shortlist updates, and final results.

### FR-08: Student Profile
The system shall maintain student information required for applications and eligibility checks.

### FR-09: Eligibility Checker
The system shall compare available student information against configured eligibility rules and explain the result.

### FR-10: Application Submission
The system shall allow eligible students to apply before the deadline and prevent duplicate applications.

### FR-11: Application Tracking
The system shall allow students to view the current status of their own applications.

### FR-12: Shortlisting
The system shall allow authorized company/TPO users to record shortlist decisions for a specific drive.

### FR-13: Recruitment Round Tracking
The system shall record round names, dates, and candidate outcomes.

### FR-14: Final Result Publication
The system shall allow authorized users to submit, verify, and publish final selection results.

### FR-15: Statistics and Reports
The system shall display college-level and branch-wise placement summaries to authorized users.

### FR-16: Search and Filters
The system shall allow drives and reports to be searched or filtered using relevant fields.

### FR-17: Export
The system may allow authorized users to export selected reports to CSV or Excel.

### FR-18: Audit Log
The system should record important actions such as approval, rejection, shortlist changes, and result publication.

---

## 5. Non-Functional Requirements

### Security
- Store passwords as salted hashes; never store plain-text passwords.
- Protect private API routes with authentication and authorization.
- Validate all input on the server, even if the frontend validates it.
- Restrict each company to its own drives and applications.
- Avoid exposing personal data in public placement statistics.
- Keep secrets and database credentials in environment variables.
- Use HTTPS in production.

### Reliability and Data Integrity
- Prevent duplicate applications for the same student and drive.
- Keep consistent links between users, drives, applications, and results.
- Validate dates and application deadlines on the server.
- Record who made important status changes and when.
- Back up production data according to college policy.

### Usability
- Provide a responsive interface for phones, tablets, and desktops.
- Use clear status labels and understandable validation messages.
- Keep common tasks accessible from the relevant dashboard.
- Provide helpful empty states when there are no drives or applications.

### Performance and Maintainability
- Paginate large applicant lists.
- Add indexes to commonly searched database fields.
- Separate frontend, backend, routes, controllers, and data models.
- Use reusable UI components and consistent error handling.

---

## 6. Recommended Technology Stack

### Frontend
- **React.js:** user interface and role-based dashboards
- **React Router:** page navigation
- **Fetch API or Axios:** communicate with backend APIs
- **CSS, Bootstrap, or Tailwind CSS:** responsive design
- **Chart.js or Recharts:** statistics and charts

### Backend
- **Node.js:** JavaScript runtime
- **Express.js:** REST API and request handling
- **JWT or secure session-based authentication:** authenticated access
- **bcrypt:** password hashing
- **Validation library or custom validation:** validate incoming data

### Database
- **MongoDB:** users, student profiles, companies, drives, applications, results, and notifications
- **Mongoose:** MongoDB schemas and validation

### Development Tools
- Visual Studio Code
- Git and GitHub
- Postman for API testing
- MongoDB Atlas or a local MongoDB installation

### Architecture

`React Frontend → Express/Node.js REST API → MongoDB Database`

The browser should not connect directly to MongoDB. All protected operations must pass through the backend, where permissions and validation are enforced.

---

## 7. Suggested System Modules

1. **Authentication Module** — login, logout, role checking, account management.
2. **Company Management Module** — company profiles and verification.
3. **Placement Drive Module** — drive request, approval, publication, schedule.
4. **Eligibility Module** — criteria configuration and rule checking.
5. **Student Application Module** — forms, validation, submission, duplicate prevention.
6. **Shortlisting Module** — candidate review, shortlist, round outcomes.
7. **Results Module** — final selection and offer status.
8. **Notification Module** — portal alerts and deadlines.
9. **Analytics Module** — summaries, charts, and exportable reports.
10. **Audit Module** — important changes and activity history.

For a short minor project, build modules 1–8 first. Add advanced analytics and audit features after the core workflow works.

---

## 8. Database Design (MongoDB Collections)

The following is a proposed design. Exact fields can be adjusted during implementation.

### 8.1 `users`

Purpose: authentication and role assignment.

Example fields:
- `_id`
- `name`
- `email`
- `passwordHash`
- `role` — `admin`, `tpo`, `company`, or `student`
- `accountStatus` — `pending`, `active`, or `disabled`
- `createdAt`
- `updatedAt`

Use unique email constraints where appropriate. Do not store plain-text passwords.

### 8.2 `students`

Purpose: student academic and contact profile.

Example fields:
- `_id`
- `userId`
- `studentId` or college roll number
- `fullName`
- `branch`
- `graduationYear`
- `semester`
- `cgpa`
- `activeBacklogs`
- `email`
- `phone` (restricted)
- `resumeUrl` (optional)
- `profileVerified`
- `createdAt`
- `updatedAt`

Restrict access to sensitive fields. Public dashboards should not expose phone numbers, roll numbers, or resumes.

### 8.3 `companies`

Purpose: company profile and access ownership.

Example fields:
- `_id`
- `userId`
- `companyName`
- `website`
- `industry`
- `recruiterName`
- `recruiterEmail`
- `verificationStatus`
- `createdAt`
- `updatedAt`

### 8.4 `placementDrives`

Purpose: each campus recruitment drive.

Example fields:
- `_id`
- `companyId`
- `jobTitle`
- `jobDescription`
- `jobLocation`
- `workMode`
- `packageDetails`
- `openings`
- `eligibleBranches`
- `minimumCgpa`
- `allowedBacklogs`
- `graduationYears`
- `applicationStart`
- `applicationDeadline`
- `driveDate`
- `selectionRounds`
- `status` — `draft`, `pendingApproval`, `changesRequested`, `approved`, `published`, `closed`, `completed`, `rejected`
- `createdAt`
- `updatedAt`
- `approvedBy`
- `approvedAt`

For a simple version, use explicit fields for the most common criteria. If arbitrary criteria are needed later, design a validated rule structure rather than accepting unrestricted code or expressions from a company.

### 8.5 `applications`

Purpose: student applications to drives.

Example fields:
- `_id`
- `driveId`
- `studentId`
- `submittedAt`
- `applicationData`
- `eligibilityStatus`
- `eligibilityReasons`
- `status`
- `lastUpdatedBy`
- `createdAt`
- `updatedAt`

Create a unique compound index on `(driveId, studentId)` to prevent duplicate applications.

### 8.6 `shortlists` or application-stage records

For a small project, shortlist and round outcomes can be stored directly in the application document. For a more extensible version, use a separate collection.

Example fields:
- `_id`
- `driveId`
- `applicationId`
- `roundName`
- `outcome`
- `remarks` (restricted)
- `updatedBy`
- `updatedAt`

### 8.7 `placementResults`

Purpose: final selection and offer information.

Example fields:
- `_id`
- `driveId`
- `studentId`
- `applicationId`
- `finalStatus`
- `packageDetails`
- `offerStatus`
- `publishedAt`
- `publishedBy`

Prevent accidental duplicate final-result records for the same application.

### 8.8 `notifications`

Purpose: in-portal announcements.

Example fields:
- `_id`
- `recipientRole` or `recipientUserId`
- `driveId` (optional)
- `title`
- `message`
- `type`
- `readAt`
- `createdAt`

For a prototype, in-app notifications are sufficient. Email or SMS can be added later if a reliable service is configured.

### 8.9 `auditLogs` (recommended)

Example fields:
- `_id`
- `actorUserId`
- `action`
- `entityType`
- `entityId`
- `timestamp`
- `metadata`

Do not put passwords, authentication tokens, or unnecessary personal data in logs.

---

## 9. Eligibility Logic

### Example

A company sets:
- Branch: CSE or IT
- Minimum CGPA: 7.00
- Active backlogs: 0
- Graduation year: 2027

A student is eligible only if every required rule is satisfied and the relevant profile data is available.

### Pseudocode

```text
function checkEligibility(student, criteria):
    reasons = []

    if student.branch is missing:
        return NEEDS_VERIFICATION

    if student.branch is not in criteria.allowedBranches:
        reasons.add("Branch does not match")

    if student.cgpa is missing:
        return NEEDS_VERIFICATION

    if student.cgpa < criteria.minimumCgpa:
        reasons.add("CGPA is below the minimum")

    if student.activeBacklogs > criteria.allowedBacklogs:
        reasons.add("Backlog criteria not satisfied")

    if student.graduationYear is not in criteria.allowedGraduationYears:
        reasons.add("Graduation year does not match")

    if reasons is empty:
        return ELIGIBLE
    else:
        return NOT_ELIGIBLE with reasons
```

**Implementation note:** The pseudocode is illustrative. Handle missing values, decimal precision, backlogs, branch aliases, and special cases explicitly. Eligibility rules should be configured and validated by authorized users, not executed as arbitrary code.

---

## 10. Proposed API Endpoints

These are suggested REST endpoints; actual paths can be changed during development.

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout` (if using sessions or token revocation)
- `GET /api/auth/me`

### Company
- `POST /api/companies`
- `GET /api/companies/me`
- `PATCH /api/companies/me`

### Placement Drives
- `POST /api/drives` — company creates request
- `GET /api/drives` — list drives allowed for current user
- `GET /api/drives/:id` — view a permitted drive
- `PATCH /api/drives/:id` — edit an authorized drive
- `POST /api/drives/:id/approve` — TPO approval
- `POST /api/drives/:id/reject` — TPO rejection
- `POST /api/drives/:id/publish` — publish approved drive
- `POST /api/drives/:id/close` — close applications

### Students and Applications
- `GET /api/students/me`
- `PATCH /api/students/me`
- `POST /api/drives/:id/check-eligibility`
- `POST /api/drives/:id/applications`
- `GET /api/applications/me`
- `GET /api/drives/:id/applications` — company/TPO access only

### Shortlists and Results
- `PATCH /api/applications/:id/status`
- `POST /api/drives/:id/shortlist`
- `POST /api/drives/:id/results`
- `GET /api/drives/:id/results` — only if the viewer is permitted

### Reports and Notifications
- `GET /api/reports/placements`
- `GET /api/reports/branches`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

Every endpoint must authenticate the user where required and verify authorization on the server. A user must not gain access simply by changing an ID in a URL.

---

## 11. Suggested User Interface Pages

### Public / Login
- Login page
- Optional company registration/request page
- Password recovery, if implemented

### TPO Dashboard
- Summary cards
- Pending company requests
- Upcoming placement drives
- Drive approval details
- Student and company management
- Applications and shortlists
- Final results
- Placement statistics and exports

### Company Dashboard
- Company profile
- Create recruitment drive
- Request status
- Own drives
- Applicants
- Shortlist and round results
- Submit final selection list

### Student Dashboard
- Profile and academic details
- Upcoming placement drives
- Drive details and eligibility reasons
- Application form
- My applications
- Shortlist and final result notifications

### UI Design Guidelines
- Use a consistent navigation menu.
- Display status with both text and visual indicators.
- Show dates and deadlines clearly.
- Ask for confirmation before publishing results.
- Use pagination and filters for applicant tables.
- Make the interface responsive on mobile screens.

---

## 12. Security, Privacy, and Access Control

Because the system stores academic and recruitment data, privacy and authorization are important.

1. Hash passwords with a suitable password-hashing algorithm such as bcrypt.
2. Protect routes using authentication middleware.
3. Enforce role and ownership checks in backend controllers.
4. Ensure companies can access only their own drives and applicants.
5. Let students access only their own private application details.
6. Restrict TPO/admin accounts and avoid hard-coded administrator credentials.
7. Validate and sanitize user input.
8. Apply file-type and size limits if resume uploads are supported.
9. Keep database credentials and secret keys in environment variables.
10. Avoid exposing personal details in placement statistics.
11. Record important approval and result-publication actions.
12. Use HTTPS and secure cookie/token practices when deployed.
13. Use sample or anonymized data for demonstrations unless the college authorizes real data.

A student’s CGPA, backlogs, contact details, resume, and application outcomes should not be publicly visible to all users by default.

---

## 13. Testing Plan

### Functional Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| T01 | Valid user logs in | Correct dashboard opens |
| T02 | Invalid password is entered | Login is rejected with a safe message |
| T03 | Company submits a drive | Drive remains pending approval |
| T04 | TPO approves a drive | Drive can be published |
| T05 | Unapproved drive is requested by a student | It is not shown as an official published drive |
| T06 | Eligible student applies | Application is saved successfully |
| T07 | Student applies twice to the same drive | Duplicate application is prevented |
| T08 | Student misses the deadline | Submission is rejected |
| T09 | Company attempts to view another company's applicants | Access is denied |
| T10 | Student opens another student's private application | Access is denied |
| T11 | Authorized user publishes a shortlist | Correct candidates and statuses appear |
| T12 | Authorized user publishes final results | Results appear to permitted viewers |
| T13 | Report is generated | Counts match the stored records |
| T14 | Required academic value is missing | System requests verification instead of making an unsupported decision |

### Non-Functional Tests
- Responsive layout on mobile and desktop
- Server-side validation
- Unauthorized route access
- Duplicate record handling
- Pagination for large lists
- Basic load testing with sample records
- Recovery from invalid input or database errors

---

## 14. Development Plan

A realistic plan for a student prototype is to build the core workflow first and defer optional features until it works end to end.

### Phase 1: Planning and Setup
- Confirm the requirements with the project guide.
- Create a Git repository.
- Set up React frontend and Express backend.
- Configure MongoDB connection and environment variables.
- Create a shared project folder structure.

### Phase 2: Authentication and Roles
- Create user model.
- Implement login and password hashing.
- Add authentication middleware.
- Implement TPO, company, and student permissions.

### Phase 3: Company and Drive Management
- Create company profile pages.
- Build the recruitment request form.
- Add TPO approval/rejection.
- Publish approved drives.

### Phase 4: Student Applications
- Build student profile pages.
- Implement eligibility checking.
- Create application form and duplicate prevention.
- Add application status tracking.

### Phase 5: Shortlisting and Results
- Build applicant table.
- Implement shortlist and recruitment-round status.
- Add final-result submission and publication.

### Phase 6: Notifications and Reports
- Add in-app notifications.
- Build summary cards and charts.
- Validate placement statistics.
- Add CSV export if time permits.

### Phase 7: Testing and Submission
- Test all three user roles.
- Test unauthorized access.
- Fix bugs and improve the interface.
- Prepare screenshots, diagrams, report, and demo data.
- Deploy only if required by the college.

---

## 15. Suggested Folder Structure

```text
campus-placement-system/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       │   ├── auth/
│       │   ├── student/
│       │   ├── company/
│       │   └── tpo/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── .gitignore
└── README.md
```

Never commit `.env` files or real credentials to GitHub.

---

## 16. Sample Demonstration Scenario

Use fictional data for the college demonstration.

**Company:** Example Technologies  
**Job Role:** Graduate Trainee  
**Eligible Branches:** CSE and IT  
**Minimum CGPA:** 7.00  
**Allowed Active Backlogs:** 0  
**Graduation Year:** 2027  
**Application Deadline:** 15 November 2026

**Demo flow**
1. Sign in as company and submit a drive request.
2. Sign in as TPO and approve it.
3. Publish the drive.
4. Sign in as a student and view the notification.
5. Show one eligible sample profile and one ineligible sample profile.
6. Submit an application using an eligible sample student.
7. Sign in as company and shortlist that applicant.
8. Record a test/interview outcome.
9. Publish the final selection result as an authorized user.
10. Show the updated TPO dashboard and placement report.

All names and records used in the demo should be fictional or approved for use.

---

## 17. Future Enhancements

Possible additions after the core project is complete:
- Email alerts for important updates
- Calendar view for upcoming drives
- Resume upload and document management
- CSV/Excel report export
- More flexible eligibility rules
- Student offer acceptance and joining status
- Multi-round interview scheduling
- Audit-log viewer
- Mobile-friendly progressive web app
- Optional integration with college single sign-on, if supported

Avoid adding features that make the project too large before the main workflow is stable.

---

## 18. Limitations

1. Eligibility decisions depend on the accuracy of student academic records and company criteria.
2. Company hiring decisions remain the responsibility of the company.
3. The portal records recruitment rounds but does not conduct tests or interviews in the initial version.
4. Notifications are in-app unless email/SMS integration is implemented.
5. Placement statistics are only as accurate as the entered and verified data.
6. A prototype should not be used with real confidential student data without college authorization and appropriate security review.

---

## 19. Expected Outcome

The completed system should provide a single place for companies to submit recruitment requests, TPO staff to approve and publish drives, students to view opportunities and apply, recruiters to shortlist candidates, and authorized users to publish final results.

It should reduce fragmented communication, make application progress easier to track, and help the college maintain consistent placement records and reports.

---

## 20. Conclusion

The **Campus Placement Communication & Tracking System** is a practical college minor project with a clear real-world use case. Its key value is not just displaying job notifications; it connects the complete process—company request, TPO approval, student application, eligibility checking, shortlisting, final selection, and placement analytics—through a role-based portal.

For the first working version, prioritize secure login, company drive requests, TPO approval, published notifications, student applications, shortlist/status updates, and final results. Add charts, exports, and advanced features once the core workflow is reliable.

---

## Appendix A: Project Summary for Viva

**Project title:** Campus Placement Communication & Tracking System

**Domain:** Web Development / Placement Management

**Problem addressed:** Placement information and student application tracking can be scattered across multiple communication channels.

**Proposed solution:** A centralized, role-based web portal for companies, TPO staff, and students.

**Main users:** TPO/Admin, Company/Recruiter, Student.

**Core modules:** Authentication, company management, placement drives, eligibility checker, applications, shortlisting, results, notifications, and reports.

**Technology stack:** React.js, Node.js, Express.js, MongoDB, Mongoose, and JWT/session-based authentication.

**Expected benefit:** Better communication, clearer placement status tracking, reduced manual work, and organized placement records.

## Appendix B: Questions to Confirm with the Project Guide

Before implementation, confirm:
1. Will company accounts be self-registered or created by the TPO?
2. Does the TPO need to approve the final selection list before publication?
3. Which eligibility rules are required for the demo?
4. Will students upload resumes, or will the first version use profile data only?
5. Is email notification required, or are in-app notifications enough?
6. Should statistics count total offers, unique placed students, or both?
7. Does the college require deployment, or is a local demonstration acceptable?
8. Which academic-year and branch data can be used in the project?

These decisions will keep the project focused and make the implementation easier to test.
