import { store } from '../data/store.js';
import { checkEligibility } from '../services/eligibilityService.js';

export const applyToDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const user = req.user;

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply to placement drives.' });
    }

    const drive = store.collection('drives').findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found.' });
    }

    if (drive.status !== 'published') {
      return res.status(400).json({ message: 'Applications are closed or drive is not yet published.' });
    }

    // Check application deadline
    if (new Date(drive.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed.' });
    }

    // Check duplicate application
    const existing = store.collection('applications').findOne({ driveId, userId: user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted an application for this drive.' });
    }

    // Verify eligibility
    const studentProfile = store.collection('students').findOne({ userId: user._id });
    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile missing. Please complete your academic details first.' });
    }

    const eligibility = checkEligibility(studentProfile, drive);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        message: 'You are not eligible for this drive.',
        reasons: eligibility.reasons
      });
    }

    const newApp = store.collection('applications').insert({
      driveId,
      companyId: drive.companyId,
      companyName: drive.companyName,
      jobTitle: drive.jobTitle,
      studentId: studentProfile._id,
      userId: user._id,
      studentName: studentProfile.fullName,
      studentEmail: studentProfile.email,
      branch: studentProfile.branch,
      cgpa: studentProfile.cgpa,
      activeBacklogs: studentProfile.activeBacklogs,
      submittedAt: new Date().toISOString(),
      eligibilityStatus: eligibility.status,
      eligibilityReasons: eligibility.reasons,
      status: 'Applied',
      currentRound: 'Application Review',
      roundHistory: [
        {
          roundName: 'Application Received',
          status: 'Applied',
          remarks: 'Submitted by student via portal',
          timestamp: new Date().toISOString()
        }
      ],
      additionalNotes: req.body.notes || ''
    });

    // Notify company
    const companyUser = store.collection('companies').findById(drive.companyId);
    if (companyUser) {
      store.collection('notifications').insert({
        recipientUserId: companyUser.userId,
        recipientRole: 'company',
        title: `New Applicant: ${studentProfile.fullName}`,
        message: `${studentProfile.fullName} (${studentProfile.branch}, CGPA: ${studentProfile.cgpa}) applied to ${drive.jobTitle}.`,
        type: 'drive',
        driveId,
        read: false
      });
    }

    // Notify student confirmation
    store.collection('notifications').insert({
      recipientUserId: user._id,
      recipientRole: 'student',
      title: `Application Confirmed: ${drive.companyName}`,
      message: `Your application for ${drive.jobTitle} was submitted successfully. Status: Applied.`,
      type: 'drive',
      driveId,
      read: false
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApp
    });
  } catch (err) {
    res.status(500).json({ message: 'Application submission failed: ' + err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const apps = store.collection('applications').find({ userId: req.user._id });
    apps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications: ' + err.message });
  }
};

export const getDriveApplicants = async (req, res) => {
  try {
    const { driveId } = req.params;
    const drive = store.collection('drives').findById(driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    // Authorization check
    if (req.user.role === 'company') {
      const company = store.collection('companies').findOne({ userId: req.user._id });
      if (!company || drive.companyId !== company._id) {
        return res.status(403).json({ message: 'Unauthorized: You can only view applicants for your company.' });
      }
    }

    const apps = store.collection('applications').find({ driveId });
    const studentsCol = store.collection('students');
    const enrichedApps = apps.map(app => {
      const student = studentsCol.findById(app.studentId) || studentsCol.findOne({ userId: app.userId }) || {};
      return {
        ...app,
        studentIdCode: student.studentId || app.studentId,
        skills: student.skills || (app.skills || []),
        resumeUrl: student.resumeUrl || app.resumeUrl || '',
        phone: student.phone || app.phone || '',
        semester: student.semester || 7,
        graduationYear: student.graduationYear || 2027,
        profileVerified: student.profileVerified || false
      };
    });
    res.json(enrichedApps);
  } catch (err) {
    res.status(500).json({ message: 'Error loading applicants: ' + err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, roundName, remarks } = req.body;

    const app = store.collection('applications').findById(id);
    if (!app) return res.status(404).json({ message: 'Application not found.' });

    const drive = store.collection('drives').findById(app.driveId);
    if (req.user.role === 'company') {
      const company = store.collection('companies').findOne({ userId: req.user._id });
      if (drive.companyId !== company._id) {
        return res.status(403).json({ message: 'Unauthorized to update this candidate.' });
      }
    }

    const updatedRoundHistory = [
      ...(app.roundHistory || []),
      {
        roundName: roundName || status,
        status,
        remarks: remarks || '',
        timestamp: new Date().toISOString()
      }
    ];

    const updated = store.collection('applications').update(id, {
      status,
      currentRound: roundName || status,
      roundHistory: updatedRoundHistory
    });

    // Notify student
    store.collection('notifications').insert({
      recipientUserId: app.userId,
      recipientRole: 'student',
      title: `Update on ${drive.companyName} Application`,
      message: `Your status for ${drive.jobTitle} has been updated to "${status}". Remarks: ${remarks || 'None'}`,
      type: 'shortlist',
      driveId: drive._id,
      read: false
    });

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'STATUS_UPDATED',
      entityType: 'Application',
      entityId: id,
      details: `${app.studentName} updated to ${status} by ${req.user.name}.`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Status update failed: ' + err.message });
  }
};

export const batchUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds, status, roundName, remarks } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'Please provide a non-empty list of application IDs.' });
    }

    const updatedApps = [];
    for (const id of applicationIds) {
      const app = store.collection('applications').findById(id);
      if (!app) continue;

      const drive = store.collection('drives').findById(app.driveId);
      const updatedRoundHistory = [
        ...(app.roundHistory || []),
        {
          roundName: roundName || status,
          status,
          remarks: remarks || 'Batch updated by recruiter',
          timestamp: new Date().toISOString()
        }
      ];

      const updated = store.collection('applications').update(id, {
        status,
        currentRound: roundName || status,
        roundHistory: updatedRoundHistory
      });

      // Notify candidate
      store.collection('notifications').insert({
        recipientUserId: app.userId,
        recipientRole: 'student',
        title: `Round Update: ${drive?.companyName || 'Recruiter'}`,
        message: `Your status for ${drive?.jobTitle || 'Placement Drive'} has been moved to "${status}".`,
        type: 'shortlist',
        driveId: app.driveId,
        read: false
      });

      updatedApps.push(updated);
    }

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'BATCH_STATUS_UPDATED',
      entityType: 'Application',
      details: `${updatedApps.length} candidates batch moved to ${status} by ${req.user.name}.`
    });

    res.json({ message: `${updatedApps.length} candidates updated successfully!`, updatedApps });
  } catch (err) {
    res.status(500).json({ message: 'Batch update failed: ' + err.message });
  }
};
