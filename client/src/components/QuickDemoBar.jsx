import React from 'react';
import {
  Sparkles,
  RefreshCw,
  UserCheck,
  Building,
  GraduationCap,
  AlertTriangle,
  Cog
} from 'lucide-react';

export const QuickDemoBar = ({ currentUser, onQuickLogin, onResetSeed, loading }) => {
  const accounts = [
    {
      name: 'TPO Officer',
      email: 'tpo@college.edu',
      role: 'tpo',
      icon: UserCheck,
      desc: 'Approvals & Analytics'
    },
    {
      name: 'Google Recruiter',
      email: 'recruiter@google.com',
      role: 'company',
      icon: Building,
      desc: 'Manage Drives & Shortlist'
    },
    {
      name: 'Rahul (Eligible CSE)',
      email: 'rahul.cse@college.edu',
      role: 'student',
      icon: GraduationCap,
      desc: 'CGPA: 8.92 | 0 Backlogs'
    },
    {
      name: 'Vikram (Mech Eng)',
      email: 'vikram.me@college.edu',
      role: 'student',
      icon: Cog,
      desc: 'Branch Filter Demo'
    },
    {
      name: 'Priya (Has Backlog)',
      email: 'priya.backlog@college.edu',
      role: 'student',
      icon: AlertTriangle,
      desc: '1 Backlog Filter Demo'
    }
  ];

  return (
    <div className="demo-switcher-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-navy)' }}>
        <Sparkles size={16} color="var(--accent-primary)" />
        <span style={{ fontWeight: 800, letterSpacing: '0.02em', fontSize: '0.8rem' }}>QUICK VIVA SWITCHER:</span>
      </div>

      <div className="demo-pills">
        {accounts.map(acc => {
          const isActive = currentUser?.email === acc.email;
          const Icon = acc.icon;
          return (
            <button
              key={acc.email}
              onClick={() => onQuickLogin(acc.email)}
              disabled={loading}
              className={`demo-pill-btn ${isActive ? 'active' : ''}`}
              title={`${acc.email} - ${acc.desc}`}
            >
              <Icon size={13} />
              <span>{acc.name}</span>
            </button>
          );
        })}
      </div>

      <div>
        <button
          onClick={onResetSeed}
          disabled={loading}
          className="demo-pill-btn"
          style={{ borderColor: '#fecdd3', color: '#be123c', background: '#fff1f2' }}
          title="Reset database to initial demo state"
        >
          <RefreshCw size={12} className={loading ? 'spin-anim' : ''} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
