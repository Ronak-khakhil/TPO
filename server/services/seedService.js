import bcrypt from 'bcryptjs';
import { store } from '../data/store.js';

export const seedDatabase = async (force = false) => {
  const usersCol = store.collection('users');
  const studentsCol = store.collection('students');
  const companiesCol = store.collection('companies');
  const drivesCol = store.collection('drives');
  const applicationsCol = store.collection('applications');
  const resultsCol = store.collection('results');
  const notificationsCol = store.collection('notifications');
  const auditLogsCol = store.collection('auditLogs');

  if (!force && usersCol.count() > 0) {
    return { message: 'Database already contains records.' };
  }

  // Clear existing
  usersCol.clear();
  studentsCol.clear();
  companiesCol.clear();
  drivesCol.clear();
  applicationsCol.clear();
  resultsCol.clear();
  notificationsCol.clear();
  auditLogsCol.clear();

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);

  // 1. Create Users
  // TPO Admin
  const tpoUser = usersCol.insert({
    name: 'Dr. Ramesh Sharma',
    email: 'tpo@college.edu',
    passwordHash: commonPassword,
    role: 'tpo',
    accountStatus: 'active'
  });

  // Companies
  const googleUser = usersCol.insert({
    name: 'Google India Talent Team',
    email: 'recruiter@google.com',
    passwordHash: commonPassword,
    role: 'company',
    accountStatus: 'active'
  });

  const msftUser = usersCol.insert({
    name: 'Microsoft University Recruiting',
    email: 'recruiter@microsoft.com',
    passwordHash: commonPassword,
    role: 'company',
    accountStatus: 'active'
  });

  const tcsUser = usersCol.insert({
    name: 'TCS Early Careers HR',
    email: 'recruiter@tcs.com',
    passwordHash: commonPassword,
    role: 'company',
    accountStatus: 'active'
  });

  // Students
  const studentUsers = [
    {
      name: 'Rahul Verma',
      email: 'rahul.cse@college.edu',
      branch: 'CSE',
      cgpa: 8.92,
      activeBacklogs: 0,
      studentId: '2023CS101',
      skills: ['React', 'Node.js', 'Data Structures', 'Python']
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.it@college.edu',
      branch: 'IT',
      cgpa: 8.15,
      activeBacklogs: 0,
      studentId: '2023IT102',
      skills: ['Java', 'Spring Boot', 'SQL', 'Docker']
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.me@college.edu',
      branch: 'ME',
      cgpa: 7.80,
      activeBacklogs: 0,
      studentId: '2023ME103',
      skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Python']
    },
    {
      name: 'Priya Patel',
      email: 'priya.backlog@college.edu',
      branch: 'CSE',
      cgpa: 7.20,
      activeBacklogs: 1,
      studentId: '2023CS104',
      skills: ['JavaScript', 'HTML/CSS', 'C++']
    },
    {
      name: 'Kartik Nair',
      email: 'kartik.ece@college.edu',
      branch: 'ECE',
      cgpa: 6.40,
      activeBacklogs: 0,
      studentId: '2023EC105',
      skills: ['Embedded C', 'IoT', 'VLSI']
    }
  ];

  const createdStudents = [];
  for (const s of studentUsers) {
    const userDoc = usersCol.insert({
      name: s.name,
      email: s.email,
      passwordHash: commonPassword,
      role: 'student',
      accountStatus: 'active'
    });

    const studentDoc = studentsCol.insert({
      userId: userDoc._id,
      studentId: s.studentId,
      fullName: s.name,
      email: s.email,
      branch: s.branch,
      graduationYear: 2027,
      semester: 7,
      cgpa: s.cgpa,
      activeBacklogs: s.activeBacklogs,
      skills: s.skills,
      phone: '+91 98765 43210',
      resumeUrl: 'https://example.com/resumes/' + s.studentId + '.pdf',
      profileVerified: true
    });

    createdStudents.push({ user: userDoc, profile: studentDoc });
  }

  // 2. Company Profiles
  const googleCompany = companiesCol.insert({
    userId: googleUser._id,
    companyName: 'Google',
    website: 'https://careers.google.com',
    industry: 'Technology & Cloud',
    recruiterName: 'Aditi Deshmukh',
    recruiterEmail: 'recruiter@google.com',
    verificationStatus: 'verified',
    location: 'Bangalore / Hyderabad'
  });

  const msftCompany = companiesCol.insert({
    userId: msftUser._id,
    companyName: 'Microsoft',
    website: 'https://careers.microsoft.com',
    industry: 'Software & Cloud Services',
    recruiterName: 'Kunal Kapoor',
    recruiterEmail: 'recruiter@microsoft.com',
    verificationStatus: 'verified',
    location: 'Hyderabad / Noida'
  });

  const tcsCompany = companiesCol.insert({
    userId: tcsUser._id,
    companyName: 'Tata Consultancy Services',
    website: 'https://www.tcs.com/careers',
    industry: 'IT Services & Consulting',
    recruiterName: 'Sunita Rao',
    recruiterEmail: 'recruiter@tcs.com',
    verificationStatus: 'verified',
    location: 'Pan India'
  });

  // Unverified recruiter for demo (Wipro - pending TPO verification)
  const wiproUser = usersCol.insert({
    name: 'Wipro Campus Recruiting',
    email: 'recruiter@wipro.com',
    passwordHash: commonPassword,
    role: 'company',
    accountStatus: 'pendingVerification'
  });

  const wiproCompany = companiesCol.insert({
    userId: wiproUser._id,
    companyName: 'Wipro',
    website: 'https://careers.wipro.com',
    industry: 'IT Services & Consulting',
    recruiterName: 'Arjun Mehta',
    recruiterEmail: 'recruiter@wipro.com',
    verificationStatus: 'pending',
    location: 'Bangalore / Pune'
  });

  // Notification to TPO about pending Wipro recruiter
  notificationsCol.insert({
    recipientUserId: tpoUser._id,
    recipientRole: 'tpo',
    title: 'New Recruiter Registration: Wipro',
    message: 'Arjun Mehta from Wipro has registered as a recruiter and is awaiting your verification.',
    type: 'approval',
    read: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  });

  // Audit log for Wipro registration
  auditLogsCol.insert({
    actorUserId: wiproUser._id,
    actorName: 'Wipro Campus Recruiting',
    actorRole: 'company',
    action: 'RECRUITER_REGISTERED',
    entityType: 'Company',
    entityId: wiproCompany._id,
    details: 'New recruiter registered: Wipro (recruiter@wipro.com). Awaiting TPO verification.',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  });

  // 3. Placement Drives
  const googleDrive = drivesCol.insert({
    companyId: googleCompany._id,
    companyName: 'Google',
    jobTitle: 'Software Development Engineer (SDE-1)',
    jobDescription:
      'We are looking for ambitious software engineering graduates to build hyper-scale distributed cloud systems, modern web platforms, and machine learning infrastructure.',
    jobLocation: 'Bangalore / Hyderabad',
    workMode: 'Hybrid',
    packageDetails: {
      ctc: '₹28.5 LPA',
      stipend: '₹1.10 Lakh/month internship',
      breakdown: 'Base ₹18L + RSUs ₹8L + Joining Bonus ₹2.5L'
    },
    openings: 12,
    eligibleBranches: ['CSE', 'IT'],
    minimumCgpa: 7.50,
    allowedBacklogs: 0,
    graduationYears: [2027],
    applicationStart: new Date(Date.now() - 5 * 86400000).toISOString(),
    applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    driveDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    selectionRounds: [
      { name: 'Online Coding Challenge', description: '90 min Data Structures & Algorithms assessment', tentativeDate: '2026-11-05' },
      { name: 'Technical Round 1', description: 'Core problem solving and CS fundamentals', tentativeDate: '2026-11-10' },
      { name: 'System Design & Problem Solving', description: 'Architecture, DB, and scalability discussion', tentativeDate: '2026-11-12' },
      { name: 'Googleyness & Leadership', description: 'Cultural fit and behavioral interview', tentativeDate: '2026-11-15' }
    ],
    status: 'published',
    approvedBy: tpoUser.name,
    approvedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  const msftDrive = drivesCol.insert({
    companyId: msftCompany._id,
    companyName: 'Microsoft',
    jobTitle: 'Associate Cloud Solutions Engineer',
    jobDescription:
      'Join Microsoft Azure engineering teams delivering enterprise cloud scalability, DevOps pipelines, and AI cloud services globally.',
    jobLocation: 'Hyderabad',
    workMode: 'Hybrid',
    packageDetails: {
      ctc: '₹19.2 LPA',
      stipend: '₹85,000/month',
      breakdown: 'Base ₹14L + Performance Bonus ₹3L + Relocation ₹2.2L'
    },
    openings: 8,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    minimumCgpa: 7.00,
    allowedBacklogs: 0,
    graduationYears: [2027],
    applicationStart: new Date(Date.now() - 1 * 86400000).toISOString(),
    applicationDeadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    driveDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    selectionRounds: [
      { name: 'Azure Assessment & Aptitude', description: 'Cognitive and programming test', tentativeDate: '2026-11-18' },
      { name: 'Cloud & Tech Interview', description: 'Networking, OS, and cloud fundamentals', tentativeDate: '2026-11-20' },
      { name: 'HR / Final Managerial', description: 'Role alignment and career pathway', tentativeDate: '2026-11-22' }
    ],
    status: 'pendingApproval', // Great for showing TPO approval workflow in viva!
    tpoRemarks: 'Submitted by Microsoft recruiter Kunal Kapoor. Awaiting TPO review.'
  });

  const tcsDrive = drivesCol.insert({
    companyId: tcsCompany._id,
    companyName: 'Tata Consultancy Services',
    jobTitle: 'Systems Engineer & Digital Specialist',
    jobDescription:
      'National qualifier drive for engineering graduates across all streams. Opportunities in Digital, AI, Cloud, and Engineering solutions.',
    jobLocation: 'Pan India (Multiple locations)',
    workMode: 'On-site',
    packageDetails: {
      ctc: '₹9.0 LPA (Digital) / ₹4.5 LPA (Ninja)',
      stipend: 'N/A',
      breakdown: 'Tiered compensation based on NQT performance rank'
    },
    openings: 45,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'ME', 'EE', 'Civil'],
    minimumCgpa: 6.50,
    allowedBacklogs: 1, // Allows 1 backlog!
    graduationYears: [2027],
    applicationStart: new Date(Date.now() - 8 * 86400000).toISOString(),
    applicationDeadline: new Date(Date.now() + 8 * 86400000).toISOString(),
    driveDate: new Date(Date.now() + 11 * 86400000).toISOString(),
    selectionRounds: [
      { name: 'TCS NQT National Test', description: 'Aptitude, Verbal, Programming Logic, Hands-on Coding', tentativeDate: '2026-11-02' },
      { name: 'Technical & Managerial Interview', description: 'Domain knowledge and project discussion', tentativeDate: '2026-11-08' },
      { name: 'HR Discussion', description: 'Location preference and onboarding readiness', tentativeDate: '2026-11-09' }
    ],
    status: 'published',
    approvedBy: tpoUser.name,
    approvedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  });

  // Historical completed drive for reports
  const completedDrive = drivesCol.insert({
    companyId: googleCompany._id,
    companyName: 'Amazon Web Services',
    jobTitle: 'Cloud Support Associate',
    jobDescription: 'Customer cloud architecture and infrastructure troubleshooting.',
    jobLocation: 'Bangalore',
    workMode: 'On-site',
    packageDetails: { ctc: '₹14.0 LPA', stipend: '', breakdown: 'Base ₹11L + Bonus ₹3L' },
    openings: 10,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    minimumCgpa: 6.80,
    allowedBacklogs: 0,
    graduationYears: [2026, 2027],
    applicationStart: new Date(Date.now() - 30 * 86400000).toISOString(),
    applicationDeadline: new Date(Date.now() - 20 * 86400000).toISOString(),
    driveDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    selectionRounds: [{ name: 'Technical Assessment', description: 'Networking & OS', tentativeDate: '2026-09-20' }],
    status: 'completed',
    approvedBy: tpoUser.name,
    approvedAt: new Date(Date.now() - 29 * 86400000).toISOString()
  });

  // 4. Sample Applications
  // Rahul Verma applied to Google Drive
  const rahulProfile = createdStudents[0].profile;
  const ananyaProfile = createdStudents[1].profile;
  const vikramProfile = createdStudents[2].profile;
  const priyaProfile = createdStudents[3].profile;

  const rahulGoogleApp = applicationsCol.insert({
    driveId: googleDrive._id,
    companyId: googleCompany._id,
    companyName: 'Google',
    jobTitle: googleDrive.jobTitle,
    studentId: rahulProfile._id,
    userId: createdStudents[0].user._id,
    studentName: rahulProfile.fullName,
    studentEmail: rahulProfile.email,
    branch: rahulProfile.branch,
    cgpa: rahulProfile.cgpa,
    activeBacklogs: rahulProfile.activeBacklogs,
    skills: rahulProfile.skills,
    resumeUrl: rahulProfile.resumeUrl,
    phone: rahulProfile.phone,
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['All academic requirements and criteria are satisfied.'],
    status: 'Shortlisted for Interview',
    currentRound: 'System Design & Problem Solving',
    roundHistory: [
      { roundName: 'Application Received', status: 'Applied', remarks: 'Eligible profile submitted', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { roundName: 'Online Coding Challenge', status: 'Cleared', remarks: 'Scored 100% on DSA test', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { roundName: 'Technical Round 1', status: 'Shortlisted for Interview', remarks: 'Impressive algorithmic problem solving', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() }
    ],
    additionalNotes: 'Strong knowledge in distributed systems, React, and algorithms.'
  });

  // Ananya Iyer applied to Google Drive and was Selected!
  const ananyaGoogleApp = applicationsCol.insert({
    driveId: googleDrive._id,
    companyId: googleCompany._id,
    companyName: 'Google',
    jobTitle: googleDrive.jobTitle,
    studentId: ananyaProfile._id,
    userId: createdStudents[1].user._id,
    studentName: ananyaProfile.fullName,
    studentEmail: ananyaProfile.email,
    branch: ananyaProfile.branch,
    cgpa: ananyaProfile.cgpa,
    activeBacklogs: ananyaProfile.activeBacklogs,
    skills: ananyaProfile.skills,
    resumeUrl: ananyaProfile.resumeUrl,
    phone: ananyaProfile.phone,
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['All academic requirements and criteria are satisfied.'],
    status: 'Selected',
    currentRound: 'Offer Accepted',
    roundHistory: [
      { roundName: 'Application Received', status: 'Applied', remarks: 'Eligible profile submitted', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { roundName: 'Online Coding Challenge', status: 'Cleared', remarks: 'Scored 95% on test', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { roundName: 'Technical Round 1', status: 'Cleared', remarks: 'Excellent database and system design foundations', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { roundName: 'Googleyness & Leadership', status: 'Cleared', remarks: 'Exceptional cultural fit', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { roundName: 'Final Decision', status: 'Selected', remarks: 'Offer released by Google Recruiter', timestamp: new Date().toISOString() }
    ],
    additionalNotes: 'Full-time SDE-1 offer confirmed.'
  });

  // Rahul Verma applied to TCS
  applicationsCol.insert({
    driveId: tcsDrive._id,
    companyId: tcsCompany._id,
    companyName: 'Tata Consultancy Services',
    jobTitle: tcsDrive.jobTitle,
    studentId: rahulProfile._id,
    userId: createdStudents[0].user._id,
    studentName: rahulProfile.fullName,
    studentEmail: rahulProfile.email,
    branch: rahulProfile.branch,
    cgpa: rahulProfile.cgpa,
    activeBacklogs: rahulProfile.activeBacklogs,
    skills: rahulProfile.skills,
    resumeUrl: rahulProfile.resumeUrl,
    phone: rahulProfile.phone,
    submittedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['All academic requirements and criteria are satisfied.'],
    status: 'Shortlisted for Test',
    currentRound: 'TCS NQT National Test',
    roundHistory: [
      { roundName: 'Application Received', status: 'Applied', remarks: 'Eligible profile submitted', timestamp: new Date(Date.now() - 6 * 86400000).toISOString() },
      { roundName: 'TCS NQT National Test', status: 'Shortlisted for Test', remarks: 'Admit card issued for 02 Nov', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() }
    ]
  });

  // Vikram Singh (ME) applied to TCS (allowed branches include ME!)
  applicationsCol.insert({
    driveId: tcsDrive._id,
    companyId: tcsCompany._id,
    companyName: 'Tata Consultancy Services',
    jobTitle: tcsDrive.jobTitle,
    studentId: vikramProfile._id,
    userId: createdStudents[2].user._id,
    studentName: vikramProfile.fullName,
    studentEmail: vikramProfile.email,
    branch: vikramProfile.branch,
    cgpa: vikramProfile.cgpa,
    activeBacklogs: vikramProfile.activeBacklogs,
    skills: vikramProfile.skills,
    resumeUrl: vikramProfile.resumeUrl,
    phone: vikramProfile.phone,
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['All academic requirements and criteria are satisfied.'],
    status: 'Applied',
    currentRound: 'Application Review',
    roundHistory: [
      { roundName: 'Application Received', status: 'Applied', remarks: 'Profile verified and registered', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
    ]
  });

  // 5. Official Placement Result for Ananya
  resultsCol.insert({
    driveId: googleDrive._id,
    companyId: googleCompany._id,
    companyName: 'Google',
    studentId: ananyaProfile._id,
    userId: createdStudents[1].user._id,
    studentName: ananyaProfile.fullName,
    studentEmail: ananyaProfile.email,
    branch: ananyaProfile.branch,
    jobTitle: 'Software Development Engineer (SDE-1)',
    packageOffered: '₹28.5 LPA',
    finalStatus: 'Selected',
    offerStatus: 'Accepted',
    publishedAt: new Date().toISOString(),
    publishedBy: tpoUser.name
  });

  // 6. In-Portal Notifications
  notificationsCol.insert({
    recipientUserId: createdStudents[1].user._id,
    recipientRole: 'student',
    title: 'Congratulations! Official Selection Offer from Google',
    message: 'You have been selected for Software Development Engineer (SDE-1) at Google with a package of ₹28.5 LPA!',
    type: 'result',
    driveId: googleDrive._id,
    read: false,
    createdAt: new Date().toISOString()
  });

  notificationsCol.insert({
    recipientUserId: createdStudents[0].user._id,
    recipientRole: 'student',
    title: 'Shortlisted for System Design Round - Google SDE Drive',
    message: 'Your Technical Round 1 interview was cleared. Please prepare for System Design & Coding round.',
    type: 'shortlist',
    driveId: googleDrive._id,
    read: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  });

  notificationsCol.insert({
    recipientUserId: 'ALL_STUDENTS',
    recipientRole: 'student',
    title: 'New Recruitment Drive Published: Google SDE-1',
    message: 'Google is hiring 2027 batch graduates. Check your eligibility and apply before deadline.',
    type: 'drive',
    driveId: googleDrive._id,
    read: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  notificationsCol.insert({
    recipientUserId: tpoUser._id,
    recipientRole: 'tpo',
    title: 'New Drive Request Submitted by Microsoft',
    message: 'Kunal Kapoor submitted "Associate Cloud Solutions Engineer" drive. Awaiting your approval.',
    type: 'approval',
    driveId: msftDrive._id,
    read: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  });

  // 7. Audit Trail Logs
  auditLogsCol.insert({
    actorUserId: googleUser._id,
    actorName: 'Google India Talent Team',
    actorRole: 'company',
    action: 'DRIVE_SUBMITTED',
    entityType: 'PlacementDrive',
    entityId: googleDrive._id,
    details: 'Submitted SDE-1 recruitment drive request with ₹28.5 LPA CTC.',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
  });

  auditLogsCol.insert({
    actorUserId: tpoUser._id,
    actorName: 'Dr. Ramesh Sharma',
    actorRole: 'tpo',
    action: 'DRIVE_APPROVED',
    entityType: 'PlacementDrive',
    entityId: googleDrive._id,
    details: 'Approved Google SDE-1 drive after verifying criteria and schedule.',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  auditLogsCol.insert({
    actorUserId: tpoUser._id,
    actorName: 'Dr. Ramesh Sharma',
    actorRole: 'tpo',
    action: 'DRIVE_PUBLISHED',
    entityType: 'PlacementDrive',
    entityId: googleDrive._id,
    details: 'Published drive to student portal with notification blast.',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
  });

  auditLogsCol.insert({
    actorUserId: googleUser._id,
    actorName: 'Google India Talent Team',
    actorRole: 'company',
    action: 'CANDIDATE_SHORTLISTED',
    entityType: 'Application',
    entityId: rahulGoogleApp._id,
    details: 'Shortlisted Rahul Verma for System Design round.',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
  });

  auditLogsCol.insert({
    actorUserId: tpoUser._id,
    actorName: 'Dr. Ramesh Sharma',
    actorRole: 'tpo',
    action: 'RESULT_PUBLISHED',
    entityType: 'PlacementResult',
    entityId: ananyaGoogleApp._id,
    details: 'Published official offer letter for Ananya Iyer (₹28.5 LPA at Google).',
    timestamp: new Date().toISOString()
  });

  return { message: 'Demo data seeded successfully!' };
};
