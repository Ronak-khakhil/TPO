import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Send,
  Download,
  Users,
  Building,
  Briefcase,
  Award,
  Clock,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Check,
  X,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Mail,
  MapPin
} from 'lucide-react';

export const TpoDashboard = ({
  stats,
  drives,
  auditLogs,
  students,
  companies,
  onApproveDrive,
  onRejectDrive,
  onPublishDrive,
  onVerifyRecruiter,
  onRejectRecruiter,
  onCreateRecruiter,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPendingDrive, setSelectedPendingDrive] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Recruiter management state
  const [recruiterRejectModal, setRecruiterRejectModal] = useState(null);
  const [recruiterRejectReason, setRecruiterRejectReason] = useState('');
  const [showAddRecruiterForm, setShowAddRecruiterForm] = useState(false);
  const [newRecruiter, setNewRecruiter] = useState({
    companyName: '', recruiterName: '', email: '', password: '', website: '', industry: 'Technology', location: ''
  });

  const pendingDrives = drives.filter(d => d.status === 'pendingApproval');
  const pendingRecruiters = (companies || []).filter(c => c.verificationStatus === 'pending');
  const verifiedRecruiters = (companies || []).filter(c => c.verificationStatus === 'verified');
  const rejectedRecruiters = (companies || []).filter(c => c.verificationStatus === 'rejected');
  const summary = stats?.summary || {};
  const branchMetrics = stats?.branchMetrics || [];
  const companyMetrics = stats?.companyMetrics || [];

  const handleApprove = async (driveId, publishNow = false) => {
    setActionLoading(true);
    try {
      await onApproveDrive(driveId, 'Approved by TPO Officer');
      if (publishNow) {
        await onPublishDrive(driveId);
      }
      setSelectedPendingDrive(null);
      onRefreshData();
    } catch (err) {
      alert('Approval error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (driveId) => {
    if (!rejectReason) {
      alert('Please provide a reason for rejecting the drive.');
      return;
    }
    setActionLoading(true);
    try {
      await onRejectDrive(driveId, rejectReason);
      setSelectedPendingDrive(null);
      setRejectReason('');
      onRefreshData();
    } catch (err) {
      alert('Rejection error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyRecruiterAction = async (companyId) => {
    setActionLoading(true);
    try {
      await onVerifyRecruiter(companyId, 'Verified by TPO');
      onRefreshData();
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRecruiterAction = async (companyId) => {
    if (!recruiterRejectReason) {
      alert('Please provide a reason for rejecting the recruiter.');
      return;
    }
    setActionLoading(true);
    try {
      await onRejectRecruiter(companyId, recruiterRejectReason);
      setRecruiterRejectModal(null);
      setRecruiterRejectReason('');
      onRefreshData();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRecruiter = async (e) => {
    e.preventDefault();
    if (!newRecruiter.companyName || !newRecruiter.recruiterName || !newRecruiter.email) {
      alert('Company name, recruiter name, and email are required.');
      return;
    }
    setActionLoading(true);
    try {
      await onCreateRecruiter(newRecruiter);
      setShowAddRecruiterForm(false);
      setNewRecruiter({ companyName: '', recruiterName: '', email: '', password: '', website: '', industry: 'Technology', location: '' });
      onRefreshData();
      alert('Recruiter account created and verified!');
    } catch (err) {
      alert('Failed to create recruiter: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const token = localStorage.getItem('cp_token');
    window.open(`/api/reports/export-csv?token=${token}`, '_blank');
  };

  return (
    <div>
      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="glass-card stat-card" style={{ borderTopColor: 'var(--accent-emerald)' }}>
          <div>
            <div className="stat-lbl">Unique Placed Students</div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>
              {summary.uniqueStudentsPlaced || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Out of {summary.totalGraduatingStudents || 0} eligible batch
            </span>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: 'var(--accent-emerald)' }}>
            <Award size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderTopColor: 'var(--accent-primary)' }}>
          <div>
            <div className="stat-lbl">Total Job Offers Released</div>
            <div className="stat-val" style={{ color: 'var(--accent-primary)' }}>
              {summary.totalOffers || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Includes multi-offers)
            </span>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: 'var(--accent-primary)' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderTopColor: 'var(--accent-secondary)' }}>
          <div>
            <div className="stat-lbl">College Placement Rate</div>
            <div className="stat-val" style={{ color: 'var(--accent-secondary)' }}>
              {summary.placementRatePercentage || 0}%
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Verified official rate
            </span>
          </div>
          <div className="stat-icon" style={{ background: '#f0f9ff', color: 'var(--accent-secondary)' }}>
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderTopColor: 'var(--accent-amber)' }}>
          <div>
            <div className="stat-lbl">Pending Approvals</div>
            <div className="stat-val" style={{ color: (pendingDrives.length + pendingRecruiters.length) > 0 ? 'var(--accent-amber)' : 'var(--text-main)' }}>
              {pendingDrives.length + pendingRecruiters.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {pendingDrives.length} drives + {pendingRecruiters.length} recruiters
            </span>
          </div>
          <div className="stat-icon" style={{ background: '#fffbeb', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="nav-tabs" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <BarChart3 size={17} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          >
            <Clock size={17} />
            <span>Pending Drives ({pendingDrives.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recruiters')}
            className={`tab-btn ${activeTab === 'recruiters' ? 'active' : ''}`}
            style={pendingRecruiters.length > 0 ? { position: 'relative' } : {}}
          >
            <ShieldCheck size={17} />
            <span>Recruiter Verification</span>
            {pendingRecruiters.length > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--accent-rose)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 800,
                width: '18px', height: '18px',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {pendingRecruiters.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('drives')}
            className={`tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
          >
            <Briefcase size={17} />
            <span>All Drives ({drives.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          >
            <Users size={17} />
            <span>Student Registry ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <Shield size={17} />
            <span>Audit Trail</span>
          </button>
        </div>

        <div>
          <button
            onClick={handleDownloadCsv}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', color: '#047857', fontWeight: 700 }}
          >
            <FileSpreadsheet size={15} />
            <span>Export Official CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Branch-wise distribution */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--accent-secondary)" />
              <span>Branch-Wise Placement Breakdown</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {branchMetrics.map(b => {
                const pct = b.total > 0 ? Math.round((b.placed / b.total) * 100) : 0;
                return (
                  <div key={b.branch}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{b.branch}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>{b.placed}</strong> / {b.total} placed ({pct}%) • {b.offers} offers
                      </span>
                    </div>
                    <div style={{ height: '9px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #2563eb, #0284c7)',
                          borderRadius: '6px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Company Hiring Statistics */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} color="var(--accent-primary)" />
              <span>Participating Recruiters & Hires</span>
            </h3>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Drives</th>
                    <th>Applicants</th>
                    <th>Offers Made</th>
                  </tr>
                </thead>
                <tbody>
                  {companyMetrics.map(c => (
                    <tr key={c.company}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{c.company}</strong></td>
                      <td>{c.drives}</td>
                      <td>{c.applicants}</td>
                      <td>
                        <span className="badge badge-selected" style={{ fontSize: '0.75rem' }}>
                          {c.hires} selected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pending Drive Approvals */}
      {activeTab === 'pending' && (
        <div>
          {pendingDrives.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={40} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>All company recruitment requests reviewed! No pending approvals.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingDrives.map(drive => (
                <div
                  key={drive._id}
                  className="glass-card"
                  style={{
                    padding: '1.75rem',
                    border: '1px solid #fde68a',
                    borderLeft: '5px solid var(--accent-amber)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>
                        Pending TPO Review
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                        {drive.companyName} — {drive.jobTitle}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {drive.jobDescription}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Proposed CTC</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {drive.packageDetails?.ctc}
                      </div>
                    </div>
                  </div>

                  {/* Criteria Review */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>Eligible Branches: <strong style={{ color: 'var(--text-main)' }}>{drive.eligibleBranches?.join(', ')}</strong></div>
                    <div>Min CGPA: <strong style={{ color: 'var(--text-main)' }}>{drive.minimumCgpa}</strong></div>
                    <div>Max Backlogs: <strong style={{ color: 'var(--text-main)' }}>{drive.allowedBacklogs}</strong></div>
                    <div>Graduation Year: <strong style={{ color: 'var(--text-main)' }}>{drive.graduationYears?.join(', ')}</strong></div>
                    <div>Deadline: <strong style={{ color: 'var(--text-main)' }}>{new Date(drive.applicationDeadline).toLocaleDateString()}</strong></div>
                  </div>

                  {/* TPO Decision Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedPendingDrive(drive)}
                      className="btn btn-danger btn-sm"
                    >
                      <X size={15} />
                      <span>Reject with Remarks</span>
                    </button>

                    <button
                      onClick={() => handleApprove(drive._id, false)}
                      disabled={actionLoading}
                      className="btn btn-secondary btn-sm"
                    >
                      <Check size={15} />
                      <span>Approve Only</span>
                    </button>

                    <button
                      onClick={() => handleApprove(drive._id, true)}
                      disabled={actionLoading}
                      className="btn btn-success btn-sm"
                    >
                      <Send size={15} />
                      <span>Approve & Publish to Students</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recruiter Verification */}
      {activeTab === 'recruiters' && (
        <div>
          {/* Add Recruiter Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setShowAddRecruiterForm(!showAddRecruiterForm)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserPlus size={16} />
              <span>{showAddRecruiterForm ? 'Cancel' : 'Add New Recruiter'}</span>
            </button>
          </div>

          {/* Add Recruiter Form */}
          {showAddRecruiterForm && (
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid #93c5fd', borderLeft: '5px solid var(--accent-primary)', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--accent-primary)" />
                <span>Add New Pre-Verified Recruiter</span>
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Recruiters added here are pre-verified and can log in immediately. Default password: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>password123</code>
              </p>
              <form onSubmit={handleAddRecruiter}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input type="text" required className="form-input" placeholder="e.g. Infosys"
                      value={newRecruiter.companyName}
                      onChange={e => setNewRecruiter({...newRecruiter, companyName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recruiter Name *</label>
                    <input type="text" required className="form-input" placeholder="e.g. Nisha Gupta"
                      value={newRecruiter.recruiterName}
                      onChange={e => setNewRecruiter({...newRecruiter, recruiterName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Official Email *</label>
                    <input type="email" required className="form-input" placeholder="e.g. recruiter@infosys.com"
                      value={newRecruiter.email}
                      onChange={e => setNewRecruiter({...newRecruiter, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input type="text" className="form-input" placeholder="e.g. https://careers.infosys.com"
                      value={newRecruiter.website}
                      onChange={e => setNewRecruiter({...newRecruiter, website: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select className="form-select"
                      value={newRecruiter.industry}
                      onChange={e => setNewRecruiter({...newRecruiter, industry: e.target.value})}
                    >
                      <option value="Technology">Technology</option>
                      <option value="IT Services & Consulting">IT Services & Consulting</option>
                      <option value="Software & Cloud Services">Software & Cloud Services</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-input" placeholder="e.g. Pune / Bangalore"
                      value={newRecruiter.location}
                      onChange={e => setNewRecruiter({...newRecruiter, location: e.target.value})}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddRecruiterForm(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                    <UserPlus size={15} />
                    <span>Create & Verify Recruiter</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pending Recruiters */}
          {pendingRecruiters.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--accent-amber)" />
                <span>Pending Verification ({pendingRecruiters.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRecruiters.map(company => (
                  <div
                    key={company._id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #fde68a',
                      borderLeft: '5px solid var(--accent-amber)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>
                          Pending TPO Verification
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.25rem' }}>
                          {company.companyName}
                        </h4>
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={13} /> {company.recruiterName}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Mail size={13} /> {company.recruiterEmail}
                          </span>
                          {company.website && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Globe size={13} /> {company.website}
                            </span>
                          )}
                          {company.industry && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Building size={13} /> {company.industry}
                            </span>
                          )}
                          {company.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={13} /> {company.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          onClick={() => setRecruiterRejectModal(company)}
                          className="btn btn-danger btn-sm"
                        >
                          <X size={15} />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleVerifyRecruiterAction(company._id)}
                          disabled={actionLoading}
                          className="btn btn-success btn-sm"
                        >
                          <ShieldCheck size={15} />
                          <span>Verify & Activate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Recruiters */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="var(--accent-emerald)" />
              <span>Verified Recruiters ({verifiedRecruiters.length})</span>
            </h3>
            {verifiedRecruiters.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No verified recruiters yet.</p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Recruiter</th>
                        <th>Email</th>
                        <th>Industry</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedRecruiters.map(c => (
                        <tr key={c._id}>
                          <td><strong style={{ color: 'var(--text-main)' }}>{c.companyName}</strong></td>
                          <td>{c.recruiterName}</td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--accent-primary)' }}>{c.recruiterEmail}</td>
                          <td>{c.industry || '—'}</td>
                          <td>{c.location || '—'}</td>
                          <td>
                            <span className="badge badge-eligible" style={{ fontSize: '0.7rem' }}>
                              <CheckCircle size={11} style={{ marginRight: '3px' }} /> Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Rejected Recruiters */}
          {rejectedRecruiters.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={20} color="var(--accent-rose)" />
                <span>Rejected Recruiters ({rejectedRecruiters.length})</span>
              </h3>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Recruiter</th>
                        <th>Email</th>
                        <th>Rejected By</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedRecruiters.map(c => (
                        <tr key={c._id}>
                          <td><strong style={{ color: 'var(--text-main)' }}>{c.companyName}</strong></td>
                          <td>{c.recruiterName}</td>
                          <td style={{ fontSize: '0.825rem' }}>{c.recruiterEmail}</td>
                          <td>{c.rejectedBy || '—'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--accent-rose)' }}>{c.rejectionReason || '—'}</td>
                          <td>
                            <span className="badge badge-not-eligible" style={{ fontSize: '0.7rem' }}>
                              Rejected
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty state for no pending */}
          {pendingRecruiters.length === 0 && verifiedRecruiters.length === 0 && rejectedRecruiters.length === 0 && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Building size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>No recruiter registrations yet. Use "Add New Recruiter" to invite companies.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: All Drives */}
      {activeTab === 'drives' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Package</th>
                  <th>Branches</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drives.map(drive => (
                  <tr key={drive._id}>
                    <td><strong style={{ color: 'var(--text-main)' }}>{drive.companyName}</strong></td>
                    <td>{drive.jobTitle}</td>
                    <td>{drive.packageDetails?.ctc || 'N/A'}</td>
                    <td>{drive.eligibleBranches?.join(', ')}</td>
                    <td>
                      <span className={`badge ${
                        drive.status === 'published' ? 'badge-published' :
                        drive.status === 'approved' ? 'badge-eligible' :
                        drive.status === 'pendingApproval' ? 'badge-pending' :
                        'badge-not-eligible'
                      }`}>
                        {drive.status}
                      </span>
                    </td>
                    <td>
                      {drive.status === 'approved' && (
                        <button
                          onClick={() => onPublishDrive(drive._id)}
                          className="btn btn-primary btn-sm"
                        >
                          <Send size={13} />
                          <span>Publish</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Student Registry */}
      {activeTab === 'students' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem' }}>
            College Student Academic Records & Verification Status
          </h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Batch</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td><code>{s.studentId}</code></td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{s.fullName}</strong></td>
                    <td>{s.branch}</td>
                    <td>{s.graduationYear}</td>
                    <td style={{ color: s.cgpa >= 7.5 ? 'var(--accent-emerald)' : 'var(--text-main)', fontWeight: 800 }}>
                      {s.cgpa?.toFixed(2)}
                    </td>
                    <td style={{ color: s.activeBacklogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 800 }}>
                      {s.activeBacklogs}
                    </td>
                    <td>
                      <span className="badge badge-eligible">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '1rem' }}>
            System Audit Trail Logs
          </h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{log.actorName}</strong></td>
                    <td>
                      <span className="badge" style={{ background: '#eff6ff', color: 'var(--accent-primary)', border: '1px solid #bfdbfe' }}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-published" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drive Reject Modal */}
      {selectedPendingDrive && (
        <div className="modal-overlay" onClick={() => setSelectedPendingDrive(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.5rem' }}>
              Reject Drive Request: {selectedPendingDrive.companyName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              State the reason for returning or rejecting this drive request (e.g. Schedule clash, eligibility criteria adjustment).
            </p>

            <div className="form-group">
              <label className="form-label">Rejection / Revision Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs adjustment..."
                className="form-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setSelectedPendingDrive(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedPendingDrive._id)}
                disabled={actionLoading}
                className="btn btn-danger btn-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Reject Modal */}
      {recruiterRejectModal && (
        <div className="modal-overlay" onClick={() => setRecruiterRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.5rem' }}>
              Reject Recruiter: {recruiterRejectModal.companyName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Provide the reason for rejecting this recruiter registration. The account will be disabled.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.825rem' }}>
              <div><strong>Company:</strong> {recruiterRejectModal.companyName}</div>
              <div><strong>Recruiter:</strong> {recruiterRejectModal.recruiterName}</div>
              <div><strong>Email:</strong> {recruiterRejectModal.recruiterEmail}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                rows={3}
                value={recruiterRejectReason}
                onChange={(e) => setRecruiterRejectReason(e.target.value)}
                placeholder="e.g. Unable to verify company identity, incomplete information..."
                className="form-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setRecruiterRejectModal(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectRecruiterAction(recruiterRejectModal._id)}
                disabled={actionLoading}
                className="btn btn-danger btn-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
