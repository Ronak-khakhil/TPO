import bcrypt from 'bcryptjs';
import { store } from '../data/store.js';
import { generateToken } from '../middleware/auth.js';
import { seedDatabase } from '../services/seedService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = store.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ message: 'Account has been disabled. Contact TPO office.' });
    }
    if (user.accountStatus === 'pendingVerification') {
      return res.status(403).json({ message: 'Your recruiter account is pending TPO verification. Please wait for approval or contact the TPO office.' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = store.collection('students').findOne({ userId: user._id });
    } else if (user.role === 'company') {
      profile = store.collection('companies').findOne({ userId: user._id });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      },
      profile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login: ' + err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'student') {
      profile = store.collection('students').findOne({ userId: user._id });
    } else if (user.role === 'company') {
      profile = store.collection('companies').findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      },
      profile
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve profile: ' + err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyDetails, studentDetails } = req.body;
    const existing = store.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const isCompany = (role === 'company');
    const newUser = store.collection('users').insert({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || 'student',
      accountStatus: isCompany ? 'pendingVerification' : 'active'
    });

    let profile = null;
    if (role === 'student') {
      profile = store.collection('students').insert({
        userId: newUser._id,
        studentId: studentDetails?.studentId || 'STU-' + Date.now().toString().slice(-4),
        fullName: name,
        email: newUser.email,
        branch: studentDetails?.branch || 'CSE',
        graduationYear: studentDetails?.graduationYear || 2027,
        semester: studentDetails?.semester || 7,
        cgpa: parseFloat(studentDetails?.cgpa || 7.0),
        activeBacklogs: parseInt(studentDetails?.activeBacklogs || 0, 10),
        skills: studentDetails?.skills || [],
        phone: studentDetails?.phone || '',
        resumeUrl: studentDetails?.resumeUrl || '',
        profileVerified: true
      });
    } else if (role === 'company') {
      profile = store.collection('companies').insert({
        userId: newUser._id,
        companyName: companyDetails?.companyName || name,
        website: companyDetails?.website || '',
        industry: companyDetails?.industry || 'Technology',
        recruiterName: name,
        recruiterEmail: newUser.email,
        verificationStatus: 'pending',
        location: companyDetails?.location || 'India'
      });

      // Notify TPO about the new recruiter pending verification
      store.collection('notifications').insert({
        recipientUserId: 'ALL_TPO',
        recipientRole: 'tpo',
        title: 'New Recruiter Registration Pending Verification',
        message: `${name} (${companyDetails?.companyName || name}) has registered as a recruiter and is awaiting your verification.`,
        type: 'approval',
        read: false,
        createdAt: new Date().toISOString()
      });

      // Audit log
      store.collection('auditLogs').insert({
        actorUserId: newUser._id,
        actorName: name,
        actorRole: 'company',
        action: 'RECRUITER_REGISTERED',
        entityType: 'Company',
        entityId: profile._id,
        details: `New recruiter registered: ${companyDetails?.companyName || name} (${newUser.email}). Awaiting TPO verification.`,
        timestamp: new Date().toISOString()
      });
    }

    if (isCompany) {
      // Don't issue a token for unverified company accounts
      res.status(201).json({
        message: 'Registration successful! Your recruiter account is pending TPO verification. You will be able to log in once approved.',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          accountStatus: newUser.accountStatus
        },
        profile,
        pendingVerification: true
      });
    } else {
      const token = generateToken(newUser);
      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        profile
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
};

export const resetSeed = async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ message: 'Database reset and fresh demo data seeded successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed: ' + err.message });
  }
};

export const getQuickDemoLogins = async (req, res) => {
  try {
    const users = store.collection('users').find();
    const demoAccounts = users.map(u => {
      let sub = '';
      if (u.role === 'student') {
        const p = store.collection('students').findOne({ userId: u._id });
        sub = p ? `${p.branch} | CGPA: ${p.cgpa} | Backlogs: ${p.activeBacklogs}` : '';
      } else if (u.role === 'company') {
        const c = store.collection('companies').findOne({ userId: u._id });
        sub = c ? c.companyName : '';
      }
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        subtitle: sub
      };
    });
    res.json(demoAccounts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list demo accounts.' });
  }
};
