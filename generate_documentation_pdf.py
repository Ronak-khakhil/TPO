import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)

def draw_header_footer(canvas, doc):
    """Clean header and footer callback for ReportLab."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))

    # Running Header (Pages 2+)
    if doc.page > 1:
        canvas.drawString(54, 804, "Campus Placement Communication & Tracking System - Project Implementation Report")
        canvas.setStrokeColor(colors.HexColor("#cbd5e1"))
        canvas.setLineWidth(0.5)
        canvas.line(54, 798, 541, 798)

    # Running Footer (All pages)
    canvas.setStrokeColor(colors.HexColor("#cbd5e1"))
    canvas.setLineWidth(0.5)
    canvas.line(54, 42, 541, 42)

    canvas.drawString(54, 30, "College Minor Project | Full-Stack Placement Tracking Portal")
    canvas.drawRightString(541, 30, f"Page {doc.page} of 5")
    canvas.restoreState()


def create_phase_documentation_pdf(output_path="Campus_Placement_System_Phase_Report.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=50,
        rightMargin=50,
        topMargin=46,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    h1_style = ParagraphStyle(
        'PhaseH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'PhaseH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.2,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )

    badge_complete = ParagraphStyle(
        'BadgeComplete',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.HexColor('#065f46')
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE BANNER, METADATA, AND EXECUTIVE OVERVIEW
    # =========================================================================
    header_data = [
        [
            Paragraph("<b>CAMPUS PLACEMENT COMMUNICATION & TRACKING SYSTEM</b>", ParagraphStyle('HdrTitle', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.white)),
        ],
        [
            Paragraph("Comprehensive Technical Progress Report & Phase-Wise Implementation Roadmap", ParagraphStyle('HdrSub', fontName='Helvetica', fontSize=9.5, leading=13, textColor=colors.HexColor('#e0e7ff')))
        ]
    ]
    header_table = Table(header_data, colWidths=[495])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e3a8a')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))

    # Project metadata grid
    meta_data = [
        [
            Paragraph("<b>Project Version:</b> v1.0 (Core Modules Complete)", body_style),
            Paragraph("<b>Tech Stack:</b> React (Vite) + Node/Express", body_style),
        ],
        [
            Paragraph("<b>Project Type:</b> College Minor Project", body_style),
            Paragraph("<b>Report Date:</b> October 2026", body_style),
        ],
        [
            Paragraph("<b>User Roles:</b> TPO, Recruiters, Students", body_style),
            Paragraph("<b>Automated Test Suite:</b> 21/21 Passing (100%)", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[247, 248])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "Campus placement drives in colleges typically suffer from fragmented communication. Job openings, criteria, "
        "student resumes, application statuses, and interview outcomes are frequently scattered across email threads, "
        "messaging groups, and spreadsheets. This leads to missed deadlines, student confusion, duplicate applications, "
        "and heavy administrative burden on the Training and Placement Officer (TPO).",
        body_style
    ))
    story.append(Paragraph(
        "The <b>Campus Placement Communication & Tracking System</b> resolves this by establishing a centralized, role-based "
        "portal that connects all placement stakeholders: "
        "<b>(1) External Recruiters</b> who register, submit recruitment drives, define eligibility rules, and manage multi-round shortlists; "
        "<b>(2) TPO / Administrators</b> who govern recruiter access, review and approve drives, publish opportunities, view analytics, and audit logs; and "
        "<b>(3) Students</b> who maintain academic profiles, upload resumes, verify real-time eligibility, apply with one click, and track job offers.",
        body_style
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Key Architectural Objectives & Principles", h2_style))
    story.append(Paragraph("&bull; <b>Zero Confusion:</b> Unified transparent portal for company schedules, eligibility criteria, and results.", bullet_style))
    story.append(Paragraph("&bull; <b>Automated Governance:</b> Server-enforced eligibility prevents ineligible applications automatically.", bullet_style))
    story.append(Paragraph("&bull; <b>Data Security & RBAC:</b> Strict role separation ensures recruiters cannot access unrelated students or drives.", bullet_style))
    story.append(Paragraph("&bull; <b>Viva Readiness:</b> 1-Click quick login switcher bar and database reset mechanism for rapid examiner demonstration.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: PHASE IMPLEMENTATION STATUS MATRIX
    # =========================================================================
    story.append(Paragraph("2. Phase-by-Phase Implementation Status Matrix", h1_style))
    story.append(Paragraph("The project development was divided into systematic milestone phases from core architecture to automated testing:", body_style))
    story.append(Spacer(1, 4))

    phase_summary_data = [
        [
            Paragraph("<b>Phase</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Module Title</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Key Deliverables Completed</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Status</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))
        ],
        [
            Paragraph("<b>Phase 1</b>", body_style),
            Paragraph("Core Architecture & RBAC Auth", body_style),
            Paragraph("JWT Authentication, bcrypt hashing, 3 User Roles (TPO, Company, Student), Quick Viva Demo Switcher bar, seed reset.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 2</b>", body_style),
            Paragraph("Placement Drive Lifecycle", body_style),
            Paragraph("Recruiter drive submission, TPO review & approval/rejection with remarks, drive publication to student portal.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 3</b>", body_style),
            Paragraph("Automated Eligibility Engine", body_style),
            Paragraph("Real-time eligibility evaluation on branch, CGPA, backlogs, batch year with specific failure breakdown banners.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 4</b>", body_style),
            Paragraph("Application Pipeline & Offers", body_style),
            Paragraph("One-click application with cover note, duplicate check, recruiter multi-round candidate board, student offer accept/reject.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 5</b>", body_style),
            Paragraph("Reports, Analytics & Audit", body_style),
            Paragraph("Placement summary KPIs (Placed %, Avg CTC), Branch analytics, CSV export, TPO system audit log trail, in-app notifications.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 6</b>", body_style),
            Paragraph("Recruiter Verification & Resumes", body_style),
            Paragraph("Public recruiter signup with TPO verify/reject; student resume upload (PDF/DOC/DOCX, max 5MB), streaming view with token, disk cleanup.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 7</b>", body_style),
            Paragraph("Quality Assurance & Testing", body_style),
            Paragraph("21 automated test cases passing in Node.js test runner covering auth, validation, streaming, role permissions, cleanup; Vite production build verified.", body_style),
            Paragraph("<font color='#065f46'><b>COMPLETED</b></font>", badge_complete)
        ],
        [
            Paragraph("<b>Phase 8</b>", body_style),
            Paragraph("Future Scope & Enhancements", body_style),
            Paragraph("Visual monthly recruitment calendar, student application withdrawal, simulated email dispatch, cloud MongoDB Atlas migration.", body_style),
            Paragraph("<font color='#1e40af'><b>PLANNED</b></font>", ParagraphStyle('BPln', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor('#1e40af')))
        ]
    ]

    phase_table = Table(phase_summary_data, colWidths=[46, 114, 265, 70])
    phase_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(phase_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("System User Roles & Access Boundaries", h2_style))
    rbac_data = [
        [Paragraph("<b>Role</b>", body_style), Paragraph("<b>Primary Permissions & Responsibilities</b>", body_style), Paragraph("<b>Access Scope</b>", body_style)],
        [Paragraph("<b>TPO / Admin</b>", body_style), Paragraph("Verify recruiters, approve/reject drives, publish drives, export CSV, view audit logs, manage students", body_style), Paragraph("College-wide access", body_style)],
        [Paragraph("<b>Company / Recruiter</b>", body_style), Paragraph("Submit drives, configure criteria, review applicants, update interview rounds, publish final results", body_style), Paragraph("Own company drives only", body_style)],
        [Paragraph("<b>Student</b>", body_style), Paragraph("Update academic profile, upload resume (PDF/DOCX), verify drive eligibility, apply, respond to offers", body_style), Paragraph("Own applications & profile", body_style)],
    ]
    rbac_table = Table(rbac_data, colWidths=[90, 315, 90])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(rbac_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: TECHNICAL DETAILS - PHASES 1 TO 4
    # =========================================================================
    story.append(Paragraph("3. Technical Implementation - Phases 1 to 4", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#1e3a8a'), spaceAfter=8))

    story.append(Paragraph("Phase 1: Core Architecture, RBAC & Viva Demo Quick Switcher", h2_style))
    story.append(Paragraph(
        "Established the baseline MERN architecture with robust authentication and a Viva Demo Bar for effortless presentation.",
        body_style
    ))
    story.append(Paragraph("&bull; <b>JWT Authentication:</b> 7-day signed tokens containing user ID, role, and email.", bullet_style))
    story.append(Paragraph("&bull; <b>Security Middleware:</b> <code>requireAuth</code> (extracts Bearer header and <code>?token=</code> query params) and <code>requireRole</code>.", bullet_style))
    story.append(Paragraph("&bull; <b>Quick Viva Switcher:</b> 1-Click login bar allows toggling between TPO, Google, Microsoft, TCS, and various student personas.", bullet_style))
    story.append(Paragraph("&bull; <b>Database Seed Reset:</b> <code>POST /api/auth/seed-demo</code> reloads clean, consistent demo data anytime during viva testing.", bullet_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Phase 2: Placement Drive Lifecycle & Workflow Management", h2_style))
    story.append(Paragraph(
        "Digitized the company recruitment visit workflow from initial draft to official campus publication.",
        body_style
    ))
    story.append(Paragraph("&bull; <b>Drive Creation:</b> Recruiter specifies CTC package, job role, locations, deadline, and eligibility criteria.", bullet_style))
    story.append(Paragraph("&bull; <b>TPO Governance:</b> Drives enter <code>pendingApproval</code> status. TPO reviews and approves or rejects with formal feedback.", bullet_style))
    story.append(Paragraph("&bull; <b>Publication:</b> Approved drives are published to the student portal, triggering in-app alerts to eligible students.", bullet_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Phase 3: Automated Eligibility Verification Engine", h2_style))
    story.append(Paragraph(
        "Engineered a real-time rule evaluator that matches student records against company criteria dynamically.",
        body_style
    ))
    story.append(Paragraph("&bull; <b>4-Point Rule Check:</b> Evaluates Allowed Branches, Minimum CGPA, Maximum Active Backlogs, and Target Batch Year.", bullet_style))
    story.append(Paragraph("&bull; <b>Visual Explanations:</b> Displays green 'Eligible' badge or red 'Ineligible' badge with specific reasons (e.g. <i>'Backlogs exceed maximum of 0'</i>).", bullet_style))
    story.append(Paragraph("&bull; <b>Server-Side Enforcement:</b> Prevents API bypass by re-verifying eligibility before inserting application records.", bullet_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Phase 4: Application Pipeline & Multi-Round Candidate Tracking", h2_style))
    story.append(Paragraph(
        "Provided recruiters with an interactive candidate review board and students with a stage-by-stage tracker.",
        body_style
    ))
    story.append(Paragraph("&bull; <b>Application Submission:</b> One-click application with cover notes and duplicate application prevention.", bullet_style))
    story.append(Paragraph("&bull; <b>Recruiter Candidate Board:</b> Displays applicants with branch, CGPA, backlogs, technical skill tags, and resume links.", bullet_style))
    story.append(Paragraph("&bull; <b>Stage Transitions:</b> Multi-round updates (Applied &rarr; Aptitude Test &rarr; Technical Round &rarr; Final Interview &rarr; Selected/Rejected).", bullet_style))
    story.append(Paragraph("&bull; <b>Offer Management:</b> Selected students receive formal job offers in their dashboard and can Accept or Reject.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: TECHNICAL DETAILS - PHASES 5 TO 7 & TEST MATRIX
    # =========================================================================
    story.append(Paragraph("4. Technical Implementation - Phases 5 to 7", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#1e3a8a'), spaceAfter=8))

    story.append(Paragraph("Phase 5: Reports, Placement Analytics & System Audit Trail", h2_style))
    story.append(Paragraph("&bull; <b>Placement KPIs:</b> Real-time statistics: Total Registered Students, Placement Percentage, Average Package, and Highest CTC.", bullet_style))
    story.append(Paragraph("&bull; <b>CSV Report Export:</b> <code>/api/reports/export-csv</code> exports placement records with student roll numbers, companies, and packages.", bullet_style))
    story.append(Paragraph("&bull; <b>System Audit Trail:</b> All administrative events are permanently logged with actor name, role, timestamp, and action details.", bullet_style))
    story.append(Paragraph("&bull; <b>In-App Notification Center:</b> Unread badges and instant alerts for drive announcements and application round outcomes.", bullet_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Phase 6: Recruiter Verification & Resume Document Management", h2_style))
    story.append(Paragraph("&bull; <b>Recruiter Signup & Verification:</b> External recruiters register with <code>pendingVerification</code> status. TPO reviews company website, credentials, and verifies or rejects with remarks.", bullet_style))
    story.append(Paragraph("&bull; <b>Resume File Upload:</b> Drag-and-drop zone supporting PDF, DOC, and DOCX formats up to 5MB, utilizing Multer disk storage.", bullet_style))
    story.append(Paragraph("&bull; <b>Token-Authenticated Streaming:</b> Direct inline streaming via <code>/api/students/resume?token=...</code> allows opening resumes in new browser tabs securely without cross-origin issues.", bullet_style))
    story.append(Paragraph("&bull; <b>Orphan File Cleanup:</b> Uploading a replacement resume or deleting a resume immediately unlinks the old file from disk, preventing server storage leaks.", bullet_style))
    story.append(Paragraph("&bull; <b>Cross-Role Visibility:</b> Verified recruiters and TPO officers can inspect student resumes directly from the candidate board and student registry.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Phase 7: Quality Assurance & Automated Test Suite Verification", h2_style))
    story.append(Paragraph("Automated test suite implemented in <code>server/tests/resume.test.js</code> using Node.js native test runner (<b>21/21 Passing Tests</b>):", body_style))
    story.append(Spacer(1, 2))

    test_data = [
        [
            Paragraph("<b>Test Suite Group</b>", ParagraphStyle('TTH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Scenarios Evaluated</b>", ParagraphStyle('TTH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Expected HTTP</b>", ParagraphStyle('TTH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Result</b>", ParagraphStyle('TTH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))
        ],
        [Paragraph("1. Authentication & RBAC", body_style), Paragraph("Unauthenticated upload/download/delete; Recruiter upload attempt blocked", body_style), Paragraph("401 / 403", body_style), Paragraph("<font color='#065f46'><b>4/4 PASS</b></font>", badge_complete)],
        [Paragraph("2. File Validation", body_style), Paragraph("Missing file payload; Disallowed extension (.txt/.exe); >5MB size rejection", body_style), Paragraph("400 Bad Request", body_style), Paragraph("<font color='#065f46'><b>3/3 PASS</b></font>", badge_complete)],
        [Paragraph("3. Upload & Profile Sync", body_style), Paragraph("Valid PDF upload; DB metadata update; Audit trail logged; Old file disk removal", body_style), Paragraph("200 OK", body_style), Paragraph("<font color='#065f46'><b>4/4 PASS</b></font>", badge_complete)],
        [Paragraph("4. Inline Streaming", body_style), Paragraph("Bearer token stream; ?token= query auth; TPO & Recruiter access; Cross-student 403", body_style), Paragraph("200 OK / 403", body_style), Paragraph("<font color='#065f46'><b>5/5 PASS</b></font>", badge_complete)],
        [Paragraph("5. Application Pipeline", body_style), Paragraph("Drive applicant list includes student resumeFile, originalName, studentProfileId", body_style), Paragraph("200 OK", body_style), Paragraph("<font color='#065f46'><b>1/1 PASS</b></font>", badge_complete)],
        [Paragraph("6. Deletion & Cleanup", body_style), Paragraph("Student resume delete; DB fields set to null; RESUME_DELETED audit; 404 verification", body_style), Paragraph("200 OK / 404", body_style), Paragraph("<font color='#065f46'><b>4/4 PASS</b></font>", badge_complete)],
    ]
    test_table = Table(test_data, colWidths=[120, 225, 80, 70])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
        ('PADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Production Build:</b> <code>npm run build</code> transforms 1916 client modules in 2.39s with zero bundle errors.", body_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: VIVA DEMONSTRATION SCRIPT & PHASE 8 FUTURE ROADMAP
    # =========================================================================
    story.append(Paragraph("5. College Viva Demonstration Script (2-Minute Execution Flow)", h1_style))
    story.append(Paragraph(
        "To present this project effectively in front of external examiners, execute the following 7-step sequence using the top Quick Demo Switcher bar:",
        body_style
    ))

    viva_steps = [
        ("Step 1: Recruiter Drive Submission", "Switch to 'Google Recruiter' &rarr; Click 'Submit New Drive' &rarr; Enter role 'Software Engineer', CTC 18 LPA, CGPA 7.5, Backlogs 0 &rarr; Submit. Point out the drive enters 'Pending Approval'."),
        ("Step 2: TPO Review & Publication", "Switch to 'TPO Admin' &rarr; View 'Pending Company Drives' &rarr; Click 'Approve Drive' with remarks &rarr; Click 'Publish Drive'. Point out the published status and instant notification."),
        ("Step 3: Student Eligibility & Backlog Handling", "Switch to 'Rahul Verma' (Eligible) &rarr; Point out green 'Eligible' banner. Then switch to 'Priya Patel' (has 1 backlog) &rarr; Show red 'Ineligible' banner with specific reason: <i>'Backlogs exceed maximum of 0'</i>."),
        ("Step 4: Academic Profile & Resume Upload", "In Student Dashboard &rarr; Go to 'My Academic Profile' &rarr; Drag and drop a resume PDF &rarr; Show uploaded file card &rarr; Click 'View' to demonstrate inline streaming in a new browser tab."),
        ("Step 5: Student Application Submission", "Navigate to 'Explore Drives' as eligible student &rarr; Click 'Apply' &rarr; Submit cover note. Show immediate application confirmation and duplicate prevention."),
        ("Step 6: Recruiter Candidate Review & Shortlisting", "Switch back to 'Google Recruiter' &rarr; Go to 'Applicant Tracking' &rarr; Inspect candidate &rarr; Click 'Resume' to view the uploaded PDF &rarr; Advance candidate round to 'Technical Interview'."),
        ("Step 7: TPO Reports, CSV Export & Audit Trail", "Switch to 'TPO Admin' &rarr; Show Placement Analytics KPIs and Branch breakdown &rarr; Click 'Export CSV' to download placement records &rarr; Go to 'Audit Trail' to show all recorded events.")
    ]

    for title, desc in viva_steps:
        story.append(Paragraph(f"<b>{title}:</b>", h2_style))
        story.append(Paragraph(desc, body_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("6. Phase 8 Roadmap & Future Scope", h1_style))
    story.append(Paragraph(
        "The following enhancements represent the planned Phase 8 milestone and serve as the project's official Future Scope:",
        body_style
    ))
    story.append(Paragraph("&bull; <b>Visual Recruitment Calendar:</b> Monthly calendar highlighting company visit dates, aptitude test schedules, and interview slots.", bullet_style))
    story.append(Paragraph("&bull; <b>Student Application Withdrawal:</b> Option for students to withdraw submitted applications before the deadline with recruiter notice.", bullet_style))
    story.append(Paragraph("&bull; <b>Email & SMS Gateway Dispatch:</b> Integration with SendGrid / Nodemailer to send real-time email reminders and offer letters.", bullet_style))
    story.append(Paragraph("&bull; <b>Cloud MongoDB Atlas Cluster:</b> Toggle between the local zero-config JSON persistence engine and a production MongoDB Atlas cluster.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceAfter=6))
    story.append(Paragraph(
        "<i>Document maintained & updated continuously as implementation milestones are completed. Generated for College Minor Project Viva & Evaluation.</i>",
        ParagraphStyle('DocFoot', fontName='Helvetica-Oblique', fontSize=7.5, textColor=colors.HexColor('#64748b'), alignment=1)
    ))

    doc.build(story, onFirstPage=draw_header_footer, onLaterPages=draw_header_footer)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "Campus_Placement_System_Phase_Report.pdf"
    create_phase_documentation_pdf(out)
