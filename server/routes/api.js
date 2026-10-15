import express from 'express';
import { login, register, getMe, resetSeed, getQuickDemoLogins } from '../controllers/authController.js';
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  approveDrive,
  rejectDrive,
  publishDrive,
  checkStudentEligibility
} from '../controllers/drivesController.js';
import {
  applyToDrive,
  getMyApplications,
  getDriveApplicants,
  updateApplicationStatus,
  batchUpdateApplicationStatus
} from '../controllers/applicationsController.js';
import {
  publishResult,
  getResults,
  respondToOffer
} from '../controllers/resultsController.js';
import { getPlacementStats, exportPlacementsCSV } from '../controllers/reportsController.js';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationsController.js';
import { getAuditLogs } from '../controllers/auditController.js';
import {
  updateStudentProfile,
  updateCompanyProfile,
  getAllStudents,
  getAllCompanies,
  verifyRecruiter,
  rejectRecruiter,
  createCompanyRecruiter
} from '../controllers/usersController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', requireAuth, getMe);
router.post('/auth/seed-demo', resetSeed);
router.get('/auth/demo-accounts', getQuickDemoLogins);

// --- Placement Drives ---
router.get('/drives', requireAuth, getDrives);
router.get('/drives/:id', requireAuth, getDriveById);
router.post('/drives', requireAuth, createDrive);
router.patch('/drives/:id', requireAuth, updateDrive);
router.post('/drives/:id/approve', requireAuth, requireRole(['tpo', 'admin']), approveDrive);
router.post('/drives/:id/reject', requireAuth, requireRole(['tpo', 'admin']), rejectDrive);
router.post('/drives/:id/publish', requireAuth, requireRole(['tpo', 'admin']), publishDrive);
router.get('/drives/:id/check-eligibility', requireAuth, checkStudentEligibility);

// --- Applications ---
router.post('/drives/:driveId/applications', requireAuth, applyToDrive);
router.get('/applications/me', requireAuth, getMyApplications);
router.get('/drives/:driveId/applications', requireAuth, getDriveApplicants);
router.patch('/applications/:id/status', requireAuth, updateApplicationStatus);
router.post('/applications/batch-status', requireAuth, batchUpdateApplicationStatus);

// --- Results & Offers ---
router.get('/results', requireAuth, getResults);
router.post('/results', requireAuth, publishResult);
router.post('/results/:id/respond', requireAuth, respondToOffer);

// --- Reports & Analytics ---
router.get('/reports/placements', requireAuth, getPlacementStats);
router.get('/reports/export-csv', requireAuth, exportPlacementsCSV);

// --- Notifications ---
router.get('/notifications', requireAuth, getNotifications);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);
router.post('/notifications/read-all', requireAuth, markAllNotificationsRead);

// --- Audit Trail ---
router.get('/audit-logs', requireAuth, requireRole(['tpo', 'admin']), getAuditLogs);

// --- Profiles & Management ---
router.patch('/students/profile', requireAuth, updateStudentProfile);
router.get('/students', requireAuth, requireRole(['tpo', 'admin']), getAllStudents);
router.patch('/companies/profile', requireAuth, updateCompanyProfile);
router.get('/companies', requireAuth, requireRole(['tpo', 'admin']), getAllCompanies);

// --- Recruiter Verification (TPO Only) ---
router.post('/companies/:companyId/verify', requireAuth, requireRole(['tpo', 'admin']), verifyRecruiter);
router.post('/companies/:companyId/reject', requireAuth, requireRole(['tpo', 'admin']), rejectRecruiter);
router.post('/companies/create', requireAuth, requireRole(['tpo', 'admin']), createCompanyRecruiter);

export default router;
