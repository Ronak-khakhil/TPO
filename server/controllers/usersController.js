import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from '../data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'resumes');

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

// Upload resume file (PDF/DOC/DOCX, max 5MB)
export const uploadResume = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'student' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only students can upload resumes.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No resume file provided. Please upload a PDF, DOC, or DOCX file (max 5MB).' });
    }

    let student = store.collection('students').findOne({ userId: user._id });

    // Delete old resume file if it exists to avoid orphan files
    if (student?.resumeFile) {
      const oldFilePath = path.join(UPLOADS_DIR, student.resumeFile);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.warn('Could not remove previous resume file:', e.message);
        }
      }
    }

    const resumeData = {
      resumeFile: req.file.filename,
      resumeOriginalName: req.file.originalname,
      resumeSize: req.file.size,
      resumeMimeType: req.file.mimetype,
      resumeUploadedAt: new Date().toISOString()
    };

    if (!student) {
      student = store.collection('students').insert({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        studentId: 'STU-' + Date.now().toString().slice(-4),
        profileVerified: true,
        ...resumeData
      });
    } else {
      student = store.collection('students').update(student._id, resumeData);
    }

    // System audit log
    store.collection('auditLogs').insert({
      actorUserId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'RESUME_UPLOADED',
      entityType: 'Student',
      entityId: student._id,
      details: `Resume uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resume: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: resumeData.resumeUploadedAt
      },
      student
    });
  } catch (err) {
    res.status(500).json({ message: 'Resume upload failed: ' + err.message });
  }
};

// Download / view resume file
export const downloadResume = async (req, res) => {
  try {
    const { studentId } = req.params;
    let student;

    if (studentId) {
      student = store.collection('students').findById(studentId);
      if (!student) {
        student = store.collection('students').findOne({ userId: studentId });
      }
    } else {
      student = store.collection('students').findOne({ userId: req.user._id });
    }

    if (!student || !student.resumeFile) {
      return res.status(404).json({ message: 'No resume file found for this student.' });
    }

    // Authorization check:
    // - Students can view their own resume
    // - TPO and Admin can view any student's resume
    // - Companies can view resumes of students
    const isOwner = student.userId === req.user._id;
    const isTpoOrAdmin = ['tpo', 'admin'].includes(req.user.role);
    const isCompany = req.user.role === 'company';

    if (!isOwner && !isTpoOrAdmin && !isCompany) {
      return res.status(403).json({ message: 'Unauthorized access to this resume.' });
    }

    const filePath = path.join(UPLOADS_DIR, student.resumeFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found on server disk.' });
    }

    // Set content type for inline viewing in browser
    const ext = path.extname(student.resumeFile).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${student.resumeOriginalName || student.resumeFile}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve resume: ' + err.message });
  }
};

// Delete resume file
export const deleteResume = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'student' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only students can delete their resume.' });
    }

    const student = store.collection('students').findOne({ userId: user._id });

    if (!student || !student.resumeFile) {
      return res.status(404).json({ message: 'No resume file to delete.' });
    }

    const oldName = student.resumeOriginalName || student.resumeFile;

    // Remove file from disk
    const filePath = path.join(UPLOADS_DIR, student.resumeFile);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove resume file:', e.message);
      }
    }

    // Clear resume fields from student record
    store.collection('students').update(student._id, {
      resumeFile: null,
      resumeOriginalName: null,
      resumeSize: null,
      resumeMimeType: null,
      resumeUploadedAt: null
    });

    // System audit log
    store.collection('auditLogs').insert({
      actorUserId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'RESUME_DELETED',
      entityType: 'Student',
      entityId: student._id,
      details: `Resume deleted: ${oldName}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resume: ' + err.message });
  }
};
