import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_campus_placement_2026_dev_min_project';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.collection('users').findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User account not found or deactivated.' });
    }
    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ message: 'This account has been disabled. Contact TPO.' });
    }
    if (user.accountStatus === 'pendingVerification') {
      return res.status(403).json({ message: 'Your recruiter account is pending TPO verification. Please wait for approval.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role(s).`
      });
    }
    next();
  };
};
