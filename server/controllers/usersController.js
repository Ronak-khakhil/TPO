import bcrypt from 'bcryptjs';
import { store } from '../data/store.js';

export const updateStudentProfile = async (req, res) => {
  try {
    const user = req.user;
    let student = store.collection('students').findOne({ userId: user._id });

    const { branch, cgpa, activeBacklogs, graduationYear, semester, skills, phone, resumeUrl } = req.body;

    const updates = {
      ...(branch !== undefined && { branch }),
      ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
      ...(activeBacklogs !== undefined && { activeBacklogs: parseInt(activeBacklogs, 10) }),
      ...(graduationYear !== undefined && { graduationYear: parseInt(graduationYear, 10) }),
      ...(semester !== undefined && { semester: parseInt(semester, 10) }),
      ...(skills !== undefined && { skills }),
      ...(phone !== undefined && { phone }),
      ...(resumeUrl !== undefined && { resumeUrl })
    };

    if (!student) {
      student = store.collection('students').insert({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        studentId: 'STU-' + Date.now().toString().slice(-4),
        profileVerified: true,
        ...updates
      });
    } else {
      student = store.collection('students').update(student._id, updates);
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed: ' + err.message });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const user = req.user;
    let company = store.collection('companies').findOne({ userId: user._id });

    const { companyName, website, industry, location, recruiterName } = req.body;
    const updates = {
      ...(companyName && { companyName }),
      ...(website && { website }),
      ...(industry && { industry }),
      ...(location && { location }),
      ...(recruiterName && { recruiterName })
    };

    if (!company) {
      company = store.collection('companies').insert({
        userId: user._id,
        recruiterEmail: user.email,
        verificationStatus: 'verified',
        ...updates
      });
    } else {
      company = store.collection('companies').update(company._id, updates);
    }

    res.json(company);
  } catch (err) {
    res.status(500).json({ message: 'Company profile update failed: ' + err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = store.collection('students').find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve students: ' + err.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = store.collection('companies').find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve companies: ' + err.message });
  }
};

// TPO verifies a pending recruiter account
export const verifyRecruiter = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { remarks } = req.body;

    const company = store.collection('companies').findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    // Update company verification status
    store.collection('companies').update(companyId, {
      verificationStatus: 'verified',
      verifiedBy: req.user.name,
      verifiedAt: new Date().toISOString(),
      verificationRemarks: remarks || 'Approved by TPO'
    });

    // Update user account status to active
    const companyUser = store.collection('users').findById(company.userId);
    if (companyUser) {
      store.collection('users').update(company.userId, {
        accountStatus: 'active'
      });
    }

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'RECRUITER_VERIFIED',
      entityType: 'Company',
      entityId: companyId,
      details: `Verified recruiter: ${company.companyName} (${company.recruiterName} - ${company.recruiterEmail}). Remarks: ${remarks || 'Approved by TPO'}`,
      timestamp: new Date().toISOString()
    });

    // Notify the recruiter
    store.collection('notifications').insert({
      recipientUserId: company.userId,
      recipientRole: 'company',
      title: 'Your Recruiter Account Has Been Verified!',
      message: `Your account for ${company.companyName} has been verified by the TPO. You can now log in and submit recruitment drives.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ message: `Recruiter ${company.companyName} has been verified successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed: ' + err.message });
  }
};

// TPO rejects a pending recruiter account
export const rejectRecruiter = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'A rejection reason is required.' });
    }

    const company = store.collection('companies').findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    // Update company verification status
    store.collection('companies').update(companyId, {
      verificationStatus: 'rejected',
      rejectedBy: req.user.name,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });

    // Disable user account
    const companyUser = store.collection('users').findById(company.userId);
    if (companyUser) {
      store.collection('users').update(company.userId, {
        accountStatus: 'disabled'
      });
    }

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'RECRUITER_REJECTED',
      entityType: 'Company',
      entityId: companyId,
      details: `Rejected recruiter: ${company.companyName} (${company.recruiterEmail}). Reason: ${reason}`,
      timestamp: new Date().toISOString()
    });

    res.json({ message: `Recruiter ${company.companyName} has been rejected.` });
  } catch (err) {
    res.status(500).json({ message: 'Rejection failed: ' + err.message });
  }
};

// TPO creates a new pre-verified recruiter account
export const createCompanyRecruiter = async (req, res) => {
  try {
    const { companyName, recruiterName, email, password, website, industry, location } = req.body;
    if (!companyName || !recruiterName || !email) {
      return res.status(400).json({ message: 'Company name, recruiter name, and official email are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = store.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: `A user with email ${email} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    // TPO-created recruiters are pre-verified
    const newUser = store.collection('users').insert({
      name: recruiterName,
      email: normalizedEmail,
      passwordHash,
      role: 'company',
      accountStatus: 'active'
    });

    const newCompany = store.collection('companies').insert({
      userId: newUser._id,
      companyName,
      website: website || '',
      industry: industry || 'Technology',
      recruiterName,
      recruiterEmail: normalizedEmail,
      location: location || 'India',
      verificationStatus: 'verified',
      verifiedBy: req.user?.name || 'TPO',
      verifiedAt: new Date().toISOString()
    });

    // Record in audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user?._id || newUser._id,
      actorName: req.user?.name || recruiterName,
      actorRole: req.user?.role || 'tpo',
      action: 'RECRUITER_ADDED',
      entityType: 'Company',
      entityId: newCompany._id,
      details: `New pre-verified recruiter added by TPO: ${companyName} (${recruiterName} - ${normalizedEmail})`,
      timestamp: new Date().toISOString()
    });

    // Welcome notification
    store.collection('notifications').insert({
      recipientUserId: newUser._id,
      recipientRole: 'company',
      title: 'Welcome to Campus Placement Portal',
      message: `Your recruiter account for ${companyName} has been created and verified by the TPO. You can now log in and submit recruitment drives.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Recruiter account created and verified successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      company: newCompany
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recruiter: ' + err.message });
  }
};
