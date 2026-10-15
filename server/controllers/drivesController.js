import { store } from '../data/store.js';
import { checkEligibility } from '../services/eligibilityService.js';

export const getDrives = async (req, res) => {
  try {
    const user = req.user;
    const drivesCol = store.collection('drives');
    let drives = [];

    if (user.role === 'student') {
      // Students only see published, closed, or completed drives
      drives = drivesCol.find().filter(d => ['published', 'closed', 'completed'].includes(d.status));

      const studentProfile = store.collection('students').findOne({ userId: user._id });
      const studentApps = store.collection('applications').find({ userId: user._id });

      // Augment each drive with real-time student eligibility & application status
      drives = drives.map(drive => {
        const eligibility = checkEligibility(studentProfile, drive);
        const userApp = studentApps.find(a => a.driveId === drive._id);

        return {
          ...drive,
          userEligibility: eligibility,
          userApplication: userApp ? { id: userApp._id, status: userApp.status, submittedAt: userApp.submittedAt } : null
        };
      });
    } else if (user.role === 'company') {
      const company = store.collection('companies').findOne({ userId: user._id });
      if (!company) {
        return res.status(404).json({ message: 'Company profile not found.' });
      }
      drives = drivesCol.find({ companyId: company._id });
    } else {
      // TPO / Admin sees all drives
      drives = drivesCol.find();
    }

    // Sort newest first
    drives.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving placement drives: ' + err.message });
  }
};

export const getDriveById = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found.' });
    }

    if (req.user.role === 'student' && !['published', 'closed', 'completed'].includes(drive.status)) {
      return res.status(403).json({ message: 'This recruitment drive has not been published.' });
    }

    let userEligibility = null;
    let userApplication = null;
    if (req.user.role === 'student') {
      const studentProfile = store.collection('students').findOne({ userId: req.user._id });
      userEligibility = checkEligibility(studentProfile, drive);
      userApplication = store.collection('applications').findOne({ driveId: drive._id, userId: req.user._id });
    }

    res.json({
      ...drive,
      userEligibility,
      userApplication
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading drive details: ' + err.message });
  }
};

export const createDrive = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'company' && user.role !== 'tpo') {
      return res.status(403).json({ message: 'Only recruiters and TPO staff can create drives.' });
    }

    let companyId = req.body.companyId;
    let companyName = req.body.companyName;

    if (user.role === 'company') {
      const company = store.collection('companies').findOne({ userId: user._id });
      if (!company) return res.status(400).json({ message: 'Company profile missing.' });
      companyId = company._id;
      companyName = company.companyName;
    }

    const {
      jobTitle,
      jobDescription,
      jobLocation,
      workMode,
      packageDetails,
      openings,
      eligibleBranches,
      minimumCgpa,
      allowedBacklogs,
      graduationYears,
      applicationDeadline,
      driveDate,
      selectionRounds,
      status
    } = req.body;

    const initialStatus = user.role === 'tpo' ? (status || 'published') : 'pendingApproval';

    const newDrive = store.collection('drives').insert({
      companyId,
      companyName,
      jobTitle,
      jobDescription,
      jobLocation: jobLocation || 'Multiple locations',
      workMode: workMode || 'On-site',
      packageDetails: packageDetails || { ctc: 'Disclosed during talk', stipend: '' },
      openings: parseInt(openings || 1, 10),
      eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches : ['CSE', 'IT'],
      minimumCgpa: parseFloat(minimumCgpa || 6.0),
      allowedBacklogs: parseInt(allowedBacklogs || 0, 10),
      graduationYears: Array.isArray(graduationYears) ? graduationYears.map(y => parseInt(y, 10)) : [2027],
      applicationStart: new Date().toISOString(),
      applicationDeadline: applicationDeadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      driveDate: driveDate || new Date(Date.now() + 20 * 86400000).toISOString(),
      selectionRounds: selectionRounds || [
        { name: 'Online Assessment', description: 'Technical & Aptitude test' },
        { name: 'Interview', description: 'Technical and HR rounds' }
      ],
      status: initialStatus,
      tpoRemarks: initialStatus === 'pendingApproval' ? 'Submitted for TPO approval.' : 'Created directly by TPO.'
    });

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'DRIVE_SUBMITTED',
      entityType: 'PlacementDrive',
      entityId: newDrive._id,
      details: `Recruitment drive for ${newDrive.jobTitle} submitted (${newDrive.companyName}).`
    });

    // Notify TPO if submitted by company
    if (user.role === 'company') {
      store.collection('notifications').insert({
        recipientRole: 'tpo',
        title: `New Placement Drive: ${companyName}`,
        message: `${companyName} requested a recruitment drive for "${jobTitle}". Awaiting approval.`,
        type: 'approval',
        driveId: newDrive._id,
        read: false
      });
    }

    res.status(201).json(newDrive);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting drive request: ' + err.message });
  }
};

export const updateDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    if (req.user.role === 'company') {
      const company = store.collection('companies').findOne({ userId: req.user._id });
      if (drive.companyId !== company._id) {
        return res.status(403).json({ message: 'Unauthorized: You can only edit your own drives.' });
      }
    }

    const updated = store.collection('drives').update(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update drive: ' + err.message });
  }
};

export const approveDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    const updated = store.collection('drives').update(id, {
      status: 'approved',
      approvedBy: req.user.name,
      approvedAt: new Date().toISOString(),
      tpoRemarks: req.body.remarks || 'Approved by TPO.'
    });

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: 'tpo',
      action: 'DRIVE_APPROVED',
      entityType: 'PlacementDrive',
      entityId: id,
      details: `Drive for ${drive.companyName} (${drive.jobTitle}) approved.`
    });

    res.json({ message: 'Drive approved successfully.', drive: updated });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed: ' + err.message });
  }
};

export const rejectDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    const reason = req.body.reason || 'Criteria or schedule does not align with college guidelines.';
    const updated = store.collection('drives').update(id, {
      status: 'rejected',
      tpoRemarks: reason
    });

    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: 'tpo',
      action: 'DRIVE_REJECTED',
      entityType: 'PlacementDrive',
      entityId: id,
      details: `Drive for ${drive.companyName} rejected. Reason: ${reason}`
    });

    res.json({ message: 'Drive rejected.', drive: updated });
  } catch (err) {
    res.status(500).json({ message: 'Rejection failed: ' + err.message });
  }
};

export const publishDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    const updated = store.collection('drives').update(id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });

    // Notify students
    store.collection('notifications').insert({
      recipientUserId: 'ALL_STUDENTS',
      recipientRole: 'student',
      title: `Campus Drive Published: ${drive.companyName}`,
      message: `${drive.companyName} is hiring for ${drive.jobTitle}. CTC: ${drive.packageDetails?.ctc || 'Disclosed'}. Check eligibility and apply!`,
      type: 'drive',
      driveId: drive._id,
      read: false
    });

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: 'tpo',
      action: 'DRIVE_PUBLISHED',
      entityType: 'PlacementDrive',
      entityId: id,
      details: `Published drive ${drive.companyName} - ${drive.jobTitle} to students.`
    });

    res.json({ message: 'Drive published to student portal.', drive: updated });
  } catch (err) {
    res.status(500).json({ message: 'Publishing failed: ' + err.message });
  }
};

export const checkStudentEligibility = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = store.collection('drives').findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    const studentProfile = store.collection('students').findOne({ userId: req.user._id });
    const result = checkEligibility(studentProfile, drive);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Eligibility check failed: ' + err.message });
  }
};
