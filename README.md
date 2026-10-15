# Campus Placement Communication & Tracking System 🎓

> **College Minor Project (Full Stack Web Application)**  
> Developed per requirements in `Campus_Placement_Communication_Tracking_System.md`

---

## 🌟 Key Features

1. **Role-Based Architecture & Protected Portals**:
   - **TPO / Administrator**: Review incoming company requests, approve/reject with remarks, publish drives to students, view comprehensive analytics (unique students placed vs total offers), track branch metrics, and export CSV reports.
   - **Company / Recruiter**: Post recruitment drive requests (roles, criteria, packages, multi-round schedule), review submitted applicants, update candidate stages (`Shortlisted for Test`, `Shortlisted for Interview`, `Selected`), and release official offers.
   - **Student**: View published drives, check real-time automated eligibility status (with detailed breakdown reasons if ineligible), submit applications before deadlines, track application progress on a timeline stepper, and accept/decline job offers.
2. **Automated Eligibility Engine (Section 9)**:
   - Validates **Branch**, **Minimum CGPA**, **Active Backlogs**, and **Target Batch/Year**.
   - Displays clear human-readable status:
     - `ELIGIBLE`: Satisfies all criteria.
     - `NOT_ELIGIBLE`: Precise reason shown (e.g. *"Branch 'ME' is not eligible. Required: CSE, IT."* or *"Recorded CGPA is 6.40, below minimum 7.50"*).
     - `NEEDS_VERIFICATION`: Missing profile attributes.
3. **Multi-Stage Recruitment Tracking**:
   - Live timeline stepper tracking each student's progress through rounds:
     - `Applied` ➔ `Shortlisted for Test` ➔ `Technical Interview` ➔ `Selected`
4. **Unique Placed vs Total Offers Distinction (Section 3.9)**:
   - Accurate placement reporting avoiding misleading counts when students hold multiple offers.
5. **Interactive Viva Quick-Switcher**:
   - Floating quick-switch bar allowing professors and examiners to jump between TPO Admin, Google Recruiter, Eligible Student (Rahul), and Ineligible Student (Priya/Vikram) with a single click.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ installed

### Running the Application

In the root directory, run:
```bash
node start-dev.js
```
*Or run backend and frontend separately:*
- **Backend API**: `cd server && node server.js` (Runs on `http://localhost:5000`)
- **Frontend Client**: `cd client && npm run dev` (Runs on `http://localhost:3000`)

---

## 🔑 Pre-Seeded Demo Accounts (Password: `password123`)

| Role | Name | Email | Highlights |
|---|---|---|---|
| **TPO Admin** | Dr. Ramesh Sharma | `tpo@college.edu` | Approvals, audit logs, reports & analytics |
| **Recruiter** | Google India Talent | `recruiter@google.com` | High-package drive (₹28.5 LPA), applicant review |
| **Recruiter** | Microsoft Recruiting | `recruiter@microsoft.com` | Pending drive request (ready for TPO approval demo) |
| **Recruiter** | TCS Early Careers | `recruiter@tcs.com` | All-branch inclusive drive (₹9.0 LPA, allows 1 backlog) |
| **Student** | Rahul Verma | `rahul.cse@college.edu` | **Eligible** for Google SDE (CSE, 8.92 CGPA, 0 backlogs) |
| **Student** | Ananya Iyer | `ananya.it@college.edu` | **Selected** with accepted Google offer |
| **Student** | Vikram Singh | `vikram.me@college.edu` | Mechanical Eng (7.80 CGPA) - Ineligible for CS drives, eligible for TCS |
| **Student** | Priya Patel | `priya.backlog@college.edu` | CSE (7.20 CGPA, 1 Backlog) - Tests backlog filter |

*Note: You can also use the **Quick Viva Switcher** at the top of the portal to switch roles with 1 click without typing passwords!*

---

## 📁 Project Structure

```
placement/
├── Campus_Placement_Communication_Tracking_System.md   # Project Specification
├── start-dev.js                                         # Unified dev server runner
├── package.json
│
├── server/                                              # Backend (Express REST API)
│   ├── config/                                          # DB & environment config
│   ├── controllers/                                     # Auth, Drives, Applications, Results, Reports
│   ├── data/                                            # Resilient persistent JSON store (Mongoose-ready)
│   ├── middleware/                                      # JWT auth & role protection
│   ├── routes/                                          # API routing
│   ├── services/                                        # Eligibility Engine & Seed Dataset
│   └── server.js                                        # Server entry point
│
└── client/                                              # Frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx                               # Header & notifications drawer
    │   │   ├── QuickDemoBar.jsx                         # 1-click viva test switcher
    │   │   ├── LoginView.jsx                            # Sign-in & registration
    │   │   ├── StudentDashboard.jsx                     # Student portal & eligibility engine UI
    │   │   ├── TpoDashboard.jsx                         # TPO analytics & approvals queue
    │   │   └── CompanyDashboard.jsx                     # Recruiter drive management & shortlisting
    │   ├── services/
    │   │   └── api.js                                   # API client with token management
    │   ├── App.jsx                                      # Main orchestrator
    │   └── index.css                                    # Modern glassmorphic design system
    ├── vite.config.js                                   # Vite config with /api proxy
    └── index.html
```

---

## 🧪 Viva Demonstration Scenario Walkthrough

Follow these steps during your project evaluation:
1. **Open Portal**: Open `http://localhost:3000`. You are automatically greeted by the TPO Dashboard.
2. **Review Pending Company Drive**: Click on **"Pending Approvals"** tab. Observe Microsoft's pending request. Click **"Approve & Publish to Students"**.
3. **Switch to Student**: Click **"Rahul (Eligible CSE)"** in the top Quick Switcher. Go to **"Explore Placement Drives"**. Notice Google SDE-1 shows **"Eligible to Apply"** with green checkmark.
4. **Switch to Ineligible Student**: Click **"Vikram (Mech Eng)"** or **"Priya (Has Backlog)"**. Notice Google SDE-1 dynamically flags **"Not Eligible"** and states the exact rule failure.
5. **Demonstrate TCS Drive**: Notice the TCS drive accepts Mechanical and allows 1 backlog, so Vikram and Priya are eligible!
6. **Apply to Drive**: In Rahul's portal, click **"Apply Now"** for Google or TCS.
7. **Switch to Recruiter**: Click **"Google Recruiter"**. Go to **"Applicant Review"**, view Rahul's application, and click **"Update Round"** to move him to Interview or Selected.
8. **View Reports & Export CSV**: Switch back to **"TPO Officer"**, view updated Placement Rate %, and click **"Export Official CSV"** to download the college report spreadsheet!
