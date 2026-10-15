import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export const Navbar = ({ user, profile, notifications, onLogout, onMarkNotifRead, onMarkAllNotifsRead }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'tpo':
        return { label: 'TPO Admin', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: ShieldCheck };
      case 'company':
        return { label: 'Recruiter', color: '#f0f9ff', border: '#bae6fd', text: '#0284c7', icon: Building2 };
      default:
        return { label: 'Student', color: '#ecfdf5', border: '#a7f3d0', text: '#047857', icon: GraduationCap };
    }
  };

  const badgeInfo = getRoleBadge(user?.role);
  const RoleIcon = badgeInfo.icon;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo">
          <div className="brand-icon-box">
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1, color: 'var(--accent-navy)', fontWeight: 800 }}>
              Placement<span style={{ color: 'var(--accent-primary)' }}>Track</span>
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              CAMPUS RECRUITMENT PORTAL
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
              title="Notifications"
            >
              <Bell size={18} color="var(--accent-navy)" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--accent-rose)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(225, 29, 72, 0.4)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '350px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  padding: '1.25rem',
                  zIndex: 250,
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-navy)' }}>
                    Notifications ({unreadCount} new)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotifsRead}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No notifications yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => !n.read && onMarkNotifRead(n._id)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          background: n.read ? '#f8fafc' : '#eff6ff',
                          border: `1px solid ${n.read ? '#e2e8f0' : '#bfdbfe'}`,
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.825rem', color: n.read ? 'var(--text-main)' : 'var(--accent-primary)' }}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '4px' }} />
                          )}
                        </div>
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', display: 'block', marginTop: '0.35rem' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: badgeInfo.color,
                border: `1px solid ${badgeInfo.border}`,
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.775rem',
                fontWeight: 700,
                color: badgeInfo.text
              }}
            >
              <RoleIcon size={14} />
              {badgeInfo.label}
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-navy)' }}>
                {user?.name}
              </div>
              {profile?.branch && (
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                  {profile.branch} | CGPA: {profile.cgpa}
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};
