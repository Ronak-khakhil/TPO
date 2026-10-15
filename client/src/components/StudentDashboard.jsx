import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  GraduationCap,
  Award,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';

export const StudentDashboard = ({
  user,
  profile,
  drives,
  myApplications,
  results,
  onApply,
  onRespondOffer,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'applications' | 'offers' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');

  // Profile edit states
  const [editProfile, setEditProfile] = useState({
    branch: profile?.branch || 'CSE',
    cgpa: profile?.cgpa || 8.0,
    activeBacklogs: profile?.activeBacklogs || 0,
    graduationYear: profile?.graduationYear || 2027,
    skills: profile?.skills ? profile.skills.join(', ') : '',
    phone: profile?.phone || '',
    resumeUrl: profile?.resumeUrl || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Filter drives
  const filteredDrives = drives.filter(d => {
    const matchesSearch =
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterEligibleOnly) {
      return matchesSearch && d.userEligibility?.isEligible;
    }
    return matchesSearch;
  });

  // Offers received for current student
  const studentOffers = results.filter(r => r.userId === user?.id || r.studentEmail === user?.email);

  const handleApplyClick = async (driveId) => {
    setApplying(true);
    try {
      await onApply(driveId, { notes: applyNotes });
      setSelectedDrive(null);
      setApplyNotes('');
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await onUpdateProfile({
        ...editProfile,
        skills: editProfile.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setProfileSavedMsg('Profile updated successfully!');
      setTimeout(() => setProfileSavedMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div>
      {/* Student Profile Quick Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          borderLeft: '5px solid var(--accent-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)'
            }}
          >
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
              {user?.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '2px' }}>
              <span>Roll: <strong style={{ color: 'var(--text-main)' }}>{profile?.studentId || '2023CS101'}</strong></span>
              <span>•</span>
              <span>Branch: <strong style={{ color: 'var(--text-main)' }}>{profile?.branch}</strong></span>
              <span>•</span>
              <span>Batch: <strong style={{ color: 'var(--text-main)' }}>{profile?.graduationYear}</strong></span>
              <span>•</span>
              <span>CGPA: <strong style={{ color: 'var(--accent-emerald)' }}>{profile?.cgpa?.toFixed(2)}</strong></span>
              <span>•</span>
              <span>Backlogs: <strong style={{ color: profile?.activeBacklogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{profile?.activeBacklogs}</strong></span>
            </div>

            {/* Skills tag preview on header */}
            {profile?.skills && profile.skills.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {profile.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {studentOffers.length > 0 && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#047857',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              <Award size={18} />
              <span>{studentOffers.length} Job Offer(s) Received</span>
            </div>
          )}

          {profile?.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--accent-primary)', borderColor: '#bfdbfe' }}
              title="View my uploaded resume"
            >
              <FileText size={14} />
              <span>My Resume</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => setActiveTab('drives')}
          className={`tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
        >
          <Briefcase size={17} />
          <span>Explore Placement Drives ({drives.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
        >
          <FileText size={17} />
          <span>My Applications ({myApplications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
        >
          <Award size={17} />
          <span>Placement Offers ({studentOffers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <GraduationCap size={17} />
          <span>Academic Profile & Skills</span>
        </button>
      </div>

      {/* Tab 1: Explore Placement Drives */}
      {activeTab === 'drives' && (
        <div>
          {/* Search & Filter Bar */}
          <div
            className="glass-card"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <Search size={17} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by company name, job role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={filterEligibleOnly}
                  onChange={(e) => setFilterEligibleOnly(e.target.checked)}
                />
                Show Eligible Drives Only
              </label>
            </div>
          </div>

          {/* Drives Grid */}
          <div className="drives-grid">
            {filteredDrives.map(drive => {
              const isApplied = !!drive.userApplication;
              const eligibility = drive.userEligibility;

              return (
                <div
                  key={drive._id}
                  className="glass-card interactive"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: '3px solid var(--accent-primary)'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {drive.companyName}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)', marginTop: '2px' }}>
                          {drive.jobTitle}
                        </h3>
                      </div>

                      <div
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: 'var(--accent-primary)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {drive.packageDetails?.ctc || 'CTC Disclosed'}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {drive.jobDescription}
                    </p>

                    {/* Criteria Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.775rem' }}>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 600 }}>
                        Branches: {drive.eligibleBranches?.join(', ')}
                      </span>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 600 }}>
                        Min CGPA: {drive.minimumCgpa}
                      </span>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 600 }}>
                        Max Backlogs: {drive.allowedBacklogs}
                      </span>
                    </div>

                    {/* Eligibility Status Banner */}
                    <div style={{ marginBottom: '1rem' }}>
                      {isApplied ? (
                        <div className="badge badge-applied" style={{ width: '100%', justifyContent: 'center', padding: '0.4rem' }}>
                          <CheckCircle size={14} />
                          <span>Applied ({drive.userApplication.status})</span>
                        </div>
                      ) : eligibility?.isEligible ? (
                        <div className="badge badge-eligible" style={{ width: '100%', justifyContent: 'center', padding: '0.4rem' }}>
                          <CheckCircle size={14} />
                          <span>Eligible to Apply</span>
                        </div>
                      ) : (
                        <div className="badge badge-not-eligible" style={{ width: '100%', justifyContent: 'center', padding: '0.4rem' }}>
                          <XCircle size={14} />
                          <span>Not Eligible</span>
                        </div>
                      )}

                      {!eligibility?.isEligible && eligibility?.reasons?.length > 0 && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#be123c', background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.4rem 0.65rem', borderRadius: '6px' }}>
                          {eligibility.reasons[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <span>View Details</span>
                    </button>

                    {eligibility?.isEligible && !isApplied && (
                      <button
                        onClick={() => setSelectedDrive(drive)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <span>Apply Now</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDrives.length === 0 && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Briefcase size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No placement drives found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Applications */}
      {activeTab === 'applications' && (
        <div>
          {myApplications.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>You haven't submitted any placement applications yet.</p>
              <button onClick={() => setActiveTab('drives')} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Explore Drives
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {myApplications.map(app => (
                <div key={app._id} className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>
                        {app.companyName}
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                        {app.jobTitle}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Application Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="badge badge-selected" style={{ fontSize: '0.825rem', padding: '0.4rem 0.95rem' }}>
                      Status: {app.status}
                    </div>
                  </div>

                  {/* Recruitment Progress Stepper */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recruitment Process Timeline:
                    </h4>

                    <div className="timeline-stepper">
                      {(app.roundHistory || []).map((round, idx) => (
                        <div key={idx} className="step-node">
                          <div className={`step-dot ${round.status.toLowerCase().includes('select') || round.status.toLowerCase().includes('cleared') ? 'completed' : ''}`}>
                            <Check size={11} color="white" />
                          </div>
                          <div className="step-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-navy)' }}>{round.roundName}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {new Date(round.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '2px', fontWeight: 700 }}>
                              Outcome: {round.status}
                            </div>
                            {round.remarks && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                                Remarks: "{round.remarks}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Placement Offers */}
      {activeTab === 'offers' && (
        <div>
          {studentOffers.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No final selection offers released yet. Keep preparing and applying!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {studentOffers.map(offer => (
                <div
                  key={offer._id}
                  className="glass-card"
                  style={{
                    padding: '1.75rem',
                    border: '2px solid #a7f3d0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div className="badge badge-eligible" style={{ marginBottom: '0.5rem' }}>
                        Official Campus Placement Offer
                      </div>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                        {offer.companyName}
                      </h3>
                      <p style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                        Role: {offer.jobTitle}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Package Offered</div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        {offer.packageOffered}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Authorized by {offer.publishedBy}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your Response: </span>
                      <strong style={{
                        color: offer.offerStatus === 'Accepted' ? 'var(--accent-emerald)' : offer.offerStatus === 'Declined' ? 'var(--accent-rose)' : 'var(--accent-amber)'
                      }}>
                        {offer.offerStatus || 'Pending Response'}
                      </strong>
                    </div>

                    {offer.offerStatus === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => onRespondOffer(offer._id, 'Accepted')}
                          className="btn btn-success btn-sm"
                        >
                          <Check size={15} />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          onClick={() => onRespondOffer(offer._id, 'Declined')}
                          className="btn btn-danger btn-sm"
                        >
                          <X size={15} />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Academic Profile */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.5rem' }}>
            Academic Profile, Skills & Resume
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Recruiters review your skills and resume link when assessing your application. Keep it accurate.
          </p>

          {profileSavedMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              ✓ {profileSavedMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select
                  value={editProfile.branch}
                  onChange={(e) => setEditProfile({ ...editProfile, branch: e.target.value })}
                  className="form-select"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Comm (ECE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                  <option value="Civil">Civil Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cumulative CGPA (0.00 - 10.00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={editProfile.cgpa}
                  onChange={(e) => setEditProfile({ ...editProfile, cgpa: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Backlogs / Arrears</label>
                <input
                  type="number"
                  min="0"
                  value={editProfile.activeBacklogs}
                  onChange={(e) => setEditProfile({ ...editProfile, activeBacklogs: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year (Batch)</label>
                <input
                  type="number"
                  value={editProfile.graduationYear}
                  onChange={(e) => setEditProfile({ ...editProfile, graduationYear: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Technical Skills (comma-separated for recruiters)</label>
              <input
                type="text"
                value={editProfile.skills}
                onChange={(e) => setEditProfile({ ...editProfile, skills: e.target.value })}
                className="form-input"
                placeholder="React, Java, Python, SQL, Docker, AWS"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                These will show as filterable skill tags on the recruiter's candidate review board.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Resume PDF Link / Portfolio URL</label>
              <input
                type="url"
                value={editProfile.resumeUrl}
                onChange={(e) => setEditProfile({ ...editProfile, resumeUrl: e.target.value })}
                className="form-input"
                placeholder="https://drive.google.com/file/d/your-resume.pdf"
              />
            </div>

            <button type="submit" disabled={profileSaving} className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }}>
              {profileSaving ? 'Saving Profile...' : 'Save Academic Details & Skills'}
            </button>
          </form>
        </div>
      )}

      {/* Drive Details & Apply Modal */}
      {selectedDrive && (
        <div className="modal-overlay" onClick={() => setSelectedDrive(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedDrive.companyName}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  {selectedDrive.jobTitle}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDrive(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span className="badge badge-published">
                CTC: {selectedDrive.packageDetails?.ctc || 'Disclosed'}
              </span>
              <span className="badge" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: 'var(--text-main)' }}>
                Work Mode: {selectedDrive.workMode || 'On-site'}
              </span>
              <span className="badge" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: 'var(--text-main)' }}>
                Location: {selectedDrive.jobLocation}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-navy)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                JOB DESCRIPTION
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {selectedDrive.jobDescription}
              </p>
            </div>

            {/* Criteria Breakdown */}
            <div style={{ padding: '1rem', marginBottom: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-navy)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ELIGIBILITY CRITERIA CHECK
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem' }}>
                <div>Allowed Branches: <strong style={{ color: 'var(--text-main)' }}>{selectedDrive.eligibleBranches?.join(', ')}</strong></div>
                <div>Min CGPA: <strong style={{ color: 'var(--text-main)' }}>{selectedDrive.minimumCgpa}</strong></div>
                <div>Max Backlogs: <strong style={{ color: 'var(--text-main)' }}>{selectedDrive.allowedBacklogs}</strong></div>
                <div>Target Batch: <strong style={{ color: 'var(--text-main)' }}>{selectedDrive.graduationYears?.join(', ')}</strong></div>
              </div>

              <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                {selectedDrive.userEligibility?.isEligible ? (
                  <div style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    <CheckCircle size={16} />
                    <span>Your academic record satisfies all eligibility criteria!</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent-rose)', fontSize: '0.825rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '2px' }}>
                      <XCircle size={16} />
                      <span>Not eligible for this recruitment drive:</span>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                      {selectedDrive.userEligibility?.reasons?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Process Rounds */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-navy)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                SELECTION PROCESS ROUNDS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(selectedDrive.selectionRounds || []).map((rnd, i) => (
                  <div key={i} style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <strong>Round {i + 1}: {rnd.name}</strong> — <span style={{ color: 'var(--text-muted)' }}>{rnd.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Action */}
            {selectedDrive.userApplication ? (
              <div style={{ textAlign: 'center', padding: '0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                ✓ You have already applied for this drive ({selectedDrive.userApplication.status})
              </div>
            ) : selectedDrive.userEligibility?.isEligible ? (
              <div>
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Cover Note / Key Projects (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your relevant projects, top skills or internship experience..."
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>
                <button
                  onClick={() => handleApplyClick(selectedDrive._id)}
                  disabled={applying}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {applying ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            ) : (
              <button disabled className="btn btn-secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
                Ineligible to Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
