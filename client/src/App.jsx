import React, { useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from './services/api.js';
import { Navbar } from './components/Navbar.jsx';
import { QuickDemoBar } from './components/QuickDemoBar.jsx';
import { LoginView } from './components/LoginView.jsx';
import { StudentDashboard } from './components/StudentDashboard.jsx';
import { TpoDashboard } from './components/TpoDashboard.jsx';
import { CompanyDashboard } from './components/CompanyDashboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize Auth
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (token) {
        const me = await api.getMe();
        setUser(me.user);
        setProfile(me.profile);
        await loadRoleData(me.user.role);
      } else {
        // Auto sign-in as TPO Admin by default for seamless instant demo preview
        await quickLogin('tpo@college.edu');
      }
    } catch (err) {
      console.warn('Initial session expired or not found:', err.message);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleData = async (role) => {
    try {
      // Common data
      const notifs = await api.getNotifications().catch(() => []);
      setNotifications(notifs);

      const allDrives = await api.getDrives().catch(() => []);
      setDrives(allDrives);

      if (role === 'student') {
        const apps = await api.getMyApplications().catch(() => []);
        setMyApplications(apps);
        const res = await api.getResults().catch(() => []);
        setResults(res);
      } else if (role === 'tpo' || role === 'admin') {
        const st = await api.getPlacementStats().catch(() => null);
        setStats(st);
        const stList = await api.getAllStudents().catch(() => []);
        setStudents(stList);
        const compList = await api.getAllCompanies().catch(() => []);
        setCompanies(compList);
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      } else if (role === 'company') {
        const res = await api.getResults().catch(() => []);
        setResults(res);
      }
    } catch (err) {
      console.error('Error loading role data:', err);
    }
  };

  const handleLogin = async (credentials) => {
    setActionLoading(true);
    try {
      const data = await api.login(credentials);
      setAuthToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await loadRoleData(data.user.role);
    } finally {
      setActionLoading(false);
    }
  };

  const quickLogin = async (email) => {
    setActionLoading(true);
    try {
      const data = await api.login({ email, password: 'password123' });
      setAuthToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await loadRoleData(data.user.role);
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setActionLoading(true);
    try {
      const data = await api.register(payload);
      if (data.pendingVerification) {
        // Recruiter registration - don't log in, return data for UI to show message
        return data;
      }
      setAuthToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      await loadRoleData(data.user.role);
      return data;
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setProfile(null);
    setNotifications([]);
    setDrives([]);
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean default viva demo records?')) return;
    setActionLoading(true);
    try {
      await api.resetSeedData();
      alert('Demo data reloaded! Switching to TPO dashboard.');
      await quickLogin('tpo@college.edu');
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Student Actions
  const handleApply = async (driveId, data) => {
    await api.applyToDrive(driveId, data);
    await loadRoleData(user.role);
  };

  const handleRespondOffer = async (resultId, response) => {
    await api.respondToOffer(resultId, response);
    await loadRoleData(user.role);
  };

  const handleUpdateProfile = async (data) => {
    const updated = await api.updateStudentProfile(data);
    setProfile(updated);
    await loadRoleData(user.role);
  };

  const handleUploadResume = async (file) => {
    const result = await api.uploadResume(file);
    setProfile(result.student);
    return result;
  };

  const handleDeleteResume = async () => {
    await api.deleteResume();
    // Refresh profile to clear resume fields
    const me = await api.getMe();
    setProfile(me.profile);
  };

  // TPO Actions
  const handleApproveDrive = async (driveId, remarks) => {
    await api.approveDrive(driveId, remarks);
    await loadRoleData(user.role);
  };

  const handleRejectDrive = async (driveId, reason) => {
    await api.rejectDrive(driveId, reason);
    await loadRoleData(user.role);
  };

  const handlePublishDrive = async (driveId) => {
    await api.publishDrive(driveId);
    await loadRoleData(user.role);
  };

  // Recruiter Verification (TPO)
  const handleVerifyRecruiter = async (companyId, remarks) => {
    await api.verifyRecruiter(companyId, remarks);
    await loadRoleData(user.role);
  };

  const handleRejectRecruiter = async (companyId, reason) => {
    await api.rejectRecruiter(companyId, reason);
    await loadRoleData(user.role);
  };

  const handleCreateRecruiter = async (data) => {
    await api.createRecruiter(data);
    await loadRoleData(user.role);
  };

  // Company Actions
  const handleCreateDrive = async (data) => {
    await api.createDrive(data);
    await loadRoleData(user.role);
  };

  // Notifications
  const handleMarkNotifRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Loading Campus Placement Portal...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Quick Viva Role Switcher Bar */}
      <QuickDemoBar
        currentUser={user}
        onQuickLogin={quickLogin}
        onResetSeed={handleResetSeed}
        loading={actionLoading}
      />

      {/* Main Navbar */}
      {user && (
        <Navbar
          user={user}
          profile={profile}
          notifications={notifications}
          onLogout={handleLogout}
          onMarkNotifRead={handleMarkNotifRead}
          onMarkAllNotifsRead={handleMarkAllNotifsRead}
        />
      )}

      {/* Main App Content Body */}
      <main className="content-wrapper">
        {!user ? (
          <LoginView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onQuickLogin={quickLogin}
            loading={actionLoading}
          />
        ) : user.role === 'student' ? (
          <StudentDashboard
            user={user}
            profile={profile}
            drives={drives}
            myApplications={myApplications}
            results={results}
            onApply={handleApply}
            onRespondOffer={handleRespondOffer}
            onUpdateProfile={handleUpdateProfile}
            onUploadResume={handleUploadResume}
            onDeleteResume={handleDeleteResume}
          />
        ) : user.role === 'tpo' || user.role === 'admin' ? (
          <TpoDashboard
            stats={stats}
            drives={drives}
            auditLogs={auditLogs}
            students={students}
            companies={companies}
            onApproveDrive={handleApproveDrive}
            onRejectDrive={handleRejectDrive}
            onPublishDrive={handlePublishDrive}
            onVerifyRecruiter={handleVerifyRecruiter}
            onRejectRecruiter={handleRejectRecruiter}
            onCreateRecruiter={handleCreateRecruiter}
            onRefreshData={() => loadRoleData(user.role)}
          />
        ) : (
          <CompanyDashboard
            user={user}
            profile={profile}
            drives={drives}
            onCreateDrive={handleCreateDrive}
            onRefreshData={() => loadRoleData(user.role)}
          />
        )}
      </main>
    </div>
  );
}
