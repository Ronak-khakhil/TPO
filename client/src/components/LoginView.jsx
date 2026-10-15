import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Building,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LoginView = ({ onLogin, onRegister, onQuickLogin, loading }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    try {
      if (isRegister) {
        const result = await onRegister({ name, email, password, role });
        // If the result indicates pending verification, show a message
        if (result && result.pendingVerification) {
          setPendingMessage(result.message || 'Registration successful! Your account is pending TPO verification.');
          setIsRegister(false);
        }
      } else {
        await onLogin({ email, password });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const demoAccounts = [
    { title: 'TPO Admin', email: 'tpo@college.edu', role: 'tpo', icon: Shield, subtitle: 'Dr. Ramesh Sharma' },
    { title: 'Google Recruiter', email: 'recruiter@google.com', role: 'company', icon: Building, subtitle: 'Aditi Deshmukh' },
    { title: 'Eligible Student', email: 'rahul.cse@college.edu', role: 'student', icon: GraduationCap, subtitle: 'Rahul Verma (CSE, 8.92)' },
    { title: 'Backlog Student', email: 'priya.backlog@college.edu', role: 'student', icon: GraduationCap, subtitle: 'Priya Patel (1 Backlog)' }
  ];

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 25px 60px -15px rgba(37, 99, 235, 0.15)',
          background: '#ffffff',
          border: '1px solid #cbd5e1'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="brand-icon-box"
            style={{ width: '52px', height: '52px', margin: '0 auto 1rem', borderRadius: '14px' }}
          >
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
            Campus Placement Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Communication & Recruitment Tracking System
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              fontWeight: 600
            }}
          >
            {error}
          </div>
        )}

        {pendingMessage && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              color: '#1d4ed8',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              fontWeight: 600,
              lineHeight: 1.5
            }}
          >
            ✅ {pendingMessage}
          </div>
        )}

        {/* Viva Quick Login Shortcuts */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={14} />
            <span>ONE-CLICK VIVA DEMO SIGN-IN</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {demoAccounts.map(d => {
              const Icon = d.icon;
              return (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onQuickLogin(d.email)}
                  disabled={loading}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.65rem 0.85rem',
                    textAlign: 'left',
                    background: '#f8fafc',
                    borderColor: '#cbd5e1'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-navy)' }}>
                    <Icon size={13} color="var(--accent-primary)" />
                    <span>{d.title}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {d.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR SIGN IN WITH CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="student">Student</option>
                  <option value="company">Company / Recruiter</option>
                  <option value="tpo">TPO Staff</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. user@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <span>{isRegister ? 'Create Account' : 'Sign In to Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
