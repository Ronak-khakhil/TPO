import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  PlusCircle,
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  FileText,
  Search,
  Phone,
  Mail,
  GraduationCap,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { api } from '../services/api.js';

export const CompanyDashboard = ({
  user,
  profile,
  drives,
  onCreateDrive,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'applicants' | 'new-drive'
  const [selectedDriveId, setSelectedDriveId] = useState(drives[0]?._id || '');
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  // Modals
  const [inspectCandidate, setInspectCandidate] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'Shortlisted for Interview',
    roundName: 'Technical Interview',
    remarks: ''
  });
  const [updatingCandidate, setUpdatingCandidate] = useState(false);

  // Filters & Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState(0);

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // New Drive Form state
  const [newDrive, setNewDrive] = useState({
    jobTitle: '',
    jobDescription: '',
    jobLocation: 'Bangalore / Hybrid',
    workMode: 'Hybrid',
    packageDetails: {
      ctc: '₹16.5 LPA',
      stipend: '₹50,000/month',
      breakdown: 'Base ₹12L + Bonus ₹4.5L'
    },
    openings: 5,
    eligibleBranches: ['CSE', 'IT'],
    minimumCgpa: 7.0,
    allowedBacklogs: 0,
    graduationYears: [2027],
    applicationDeadline: '2026-11-20',
    driveDate: '2026-11-28',
    selectionRounds: [
      { name: 'Online Coding Test', description: 'Data structures & problem solving' },
      { name: 'Technical Interview', description: 'System design and algorithms' },
      { name: 'HR / Final Discussion', description: 'Cultural fit and behavioral assessment' }
    ]
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (drives.length > 0 && !selectedDriveId) {
      setSelectedDriveId(drives[0]._id);
    }
  }, [drives]);

  useEffect(() => {
    if (selectedDriveId) {
      loadApplicants(selectedDriveId);
      setSelectedIds([]);
    }
  }, [selectedDriveId]);

  const loadApplicants = async (driveId) => {
    setLoadingApplicants(true);
    try {
      const data = await api.getDriveApplicants(driveId);
      setApplicants(data);
    } catch (err) {
      console.error('Error loading applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateDrive({
        ...newDrive,
        companyName: profile?.companyName || user.name
      });
      alert('Recruitment drive submitted successfully! It has been sent to the TPO for approval.');
      setActiveTab('drives');
      onRefreshData();
    } catch (err) {
      alert('Error creating drive: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateApplicantStatus = async () => {
    if (!selectedApplicant) return;
    setUpdatingCandidate(true);
    try {
      await api.updateApplicationStatus(selectedApplicant._id, statusUpdate);

      // If Selected, also publish result
      if (statusUpdate.status === 'Selected') {
        const drive = drives.find(d => d._id === selectedDriveId);
        await api.publishResult({
          driveId: selectedDriveId,
          applicationId: selectedApplicant._id,
          packageOffered: drive?.packageDetails?.ctc || 'As per offer',
          finalStatus: 'Selected'
        });
      }

      alert(`Candidate status updated to "${statusUpdate.status}"!`);
      setSelectedApplicant(null);
      loadApplicants(selectedDriveId);
      onRefreshData();
    } catch (err) {
      alert('Failed to update candidate status: ' + err.message);
    } finally {
      setUpdatingCandidate(false);
    }
  };

  const handleBatchStatus = async (targetStatus, roundName) => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      await api.batchUpdateApplicationStatus({
        applicationIds: selectedIds,
        status: targetStatus,
        roundName: roundName || targetStatus,
        remarks: `Batch shortlisted by ${user.name}`
      });
      alert(`${selectedIds.length} candidates moved to ${targetStatus}!`);
      setSelectedIds([]);
      loadApplicants(selectedDriveId);
      onRefreshData();
    } catch (err) {
      alert('Batch update failed: ' + err.message);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map(a => a._id));
    }
  };

  const handleToggleSelectId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBranchToggle = (branch) => {
    const list = [...newDrive.eligibleBranches];
    const index = list.indexOf(branch);
    if (index > -1) list.splice(index, 1);
    else list.push(branch);
    setNewDrive({ ...newDrive, eligibleBranches: list });
  };

  const allBranches = ['CSE', 'IT', 'ECE', 'ME', 'EE', 'Civil'];

  // Filtered applicants
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch =
      (app.studentName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (app.studentEmail || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (app.skills || []).some(s => s.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchesBranch = branchFilter === 'ALL' || app.branch === branchFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesCgpa = parseFloat(app.cgpa || 0) >= parseFloat(minCgpaFilter);

    return matchesSearch && matchesBranch && matchesStatus && matchesCgpa;
  });

  const selectedDrive = drives.find(d => d._id === selectedDriveId);

  return (
    <div>
      {/* Company Header */}
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
            <Briefcase size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
              {profile?.companyName || user.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '2px' }}>
              <span>Industry: <strong style={{ color: 'var(--text-main)' }}>{profile?.industry || 'Technology'}</strong></span>
              <span>•</span>
              <span>Recruiter Lead: <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong></span>
              <span>•</span>
              <span>Status: <strong style={{ color: 'var(--accent-emerald)' }}>Verified Partner</strong></span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setActiveTab('new-drive')}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Post New Drive</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => setActiveTab('drives')}
          className={`tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
        >
          <Briefcase size={17} />
          <span>Our Recruitment Drives ({drives.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
        >
          <Users size={17} />
          <span>Candidate Review & Profiles ({applicants.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('new-drive')}
          className={`tab-btn ${activeTab === 'new-drive' ? 'active' : ''}`}
        >
          <PlusCircle size={17} />
          <span>Create Recruitment Request</span>
        </button>
      </div>

      {/* Tab 1: Drives */}
      {activeTab === 'drives' && (
        <div className="drives-grid">
          {drives.map(drive => (
            <div
              key={drive._id}
              className="glass-card interactive"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                    {drive.jobTitle}
                  </h3>
                  <span className={`badge ${
                    drive.status === 'published' ? 'badge-published' :
                    drive.status === 'pendingApproval' ? 'badge-pending' :
                    drive.status === 'approved' ? 'badge-eligible' :
                    'badge-not-eligible'
                  }`}>
                    {drive.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {drive.jobDescription}
                </p>

                <div style={{ fontSize: '0.825rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ marginBottom: '4px' }}>Package: <strong style={{ color: 'var(--accent-primary)' }}>{drive.packageDetails?.ctc}</strong></div>
                  <div style={{ marginBottom: '4px' }}>Eligible: <strong>{drive.eligibleBranches?.join(', ')}</strong></div>
                  <div>Min CGPA: <strong>{drive.minimumCgpa}</strong> | Backlogs Max: <strong>{drive.allowedBacklogs}</strong></div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setSelectedDriveId(drive._id);
                    setActiveTab('applicants');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Users size={15} />
                  <span>Review Candidates ({drive.openings} Openings)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Candidate Review Board */}
      {activeTab === 'applicants' && (
        <div>
          {/* Drive Selector Header */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SELECT DRIVE:
              </label>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="form-select"
                style={{ minWidth: '300px', fontWeight: 600 }}
              >
                {drives.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.jobTitle} ({d.packageDetails?.ctc || 'CTC'}) - {d.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {selectedDrive && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Target Batch: <strong>{selectedDrive.graduationYears?.join(', ')}</strong> • Branches: <strong>{selectedDrive.eligibleBranches?.join(', ')}</strong>
              </div>
            )}
          </div>

          {/* Search, Filter & Quick Action Toolbar */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search candidate or skill (e.g. Python, React)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Branch Filter */}
              <div>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <option value="ALL">All Branches</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted for Test">Shortlisted for Test</option>
                  <option value="Shortlisted for Interview">Shortlisted for Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Not Selected">Not Selected</option>
                </select>
              </div>

              {/* Min CGPA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Min CGPA:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(e.target.value)}
                  className="form-input"
                  style={{ width: '80px', padding: '0.4rem 0.5rem' }}
                />
              </div>
            </div>

            {/* Batch Action Bar if candidates selected */}
            {selectedIds.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                  ✓ {selectedIds.length} candidate(s) selected
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleBatchStatus('Shortlisted for Test', 'Online Coding Challenge')}
                    disabled={batchActionLoading}
                    className="btn btn-secondary btn-sm"
                  >
                    Shortlist for Test
                  </button>
                  <button
                    onClick={() => handleBatchStatus('Shortlisted for Interview', 'Technical Interview')}
                    disabled={batchActionLoading}
                    className="btn btn-primary btn-sm"
                  >
                    Shortlist for Interview
                  </button>
                  <button
                    onClick={() => handleBatchStatus('Not Selected', 'Review Completed')}
                    disabled={batchActionLoading}
                    className="btn btn-danger btn-sm"
                  >
                    Mark Not Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Applicants Table */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                Candidate Applications ({filteredApplicants.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click on any student to view their full profile & resume
              </span>
            </div>

            {loadingApplicants ? (
              <p style={{ color: 'var(--text-muted)', padding: '3rem 0', textAlign: 'center' }}>Loading candidate data...</p>
            ) : filteredApplicants.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>No candidates match your filters for this drive.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length > 0 && selectedIds.length === filteredApplicants.length}
                          onChange={handleToggleSelectAll}
                        />
                      </th>
                      <th>Candidate Details</th>
                      <th>Branch & Batch</th>
                      <th>CGPA & Backlogs</th>
                      <th>Skills Highlight</th>
                      <th>Resume</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map(app => (
                      <tr key={app._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(app._id)}
                            onChange={() => handleToggleSelectId(app._id)}
                          />
                        </td>
                        <td>
                          <div
                            onClick={() => setInspectCandidate(app)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view full student profile"
                          >
                            <strong style={{ color: 'var(--accent-primary)', fontSize: '0.925rem' }}>
                              {app.studentName}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Roll: {app.studentIdCode || app.studentId || '2023CS101'} • {app.studentEmail}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{app.branch}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Batch {app.graduationYear || 2027}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.95rem' }}>
                            {app.cgpa} CGPA
                          </div>
                          <div style={{ fontSize: '0.75rem', color: app.activeBacklogs > 0 ? 'var(--accent-rose)' : 'var(--text-dim)' }}>
                            {app.activeBacklogs} backlogs
                          </div>
                        </td>
                        <td>
                          {/* SKILLS CHIPS */}
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '240px' }}>
                            {(app.skills || []).length > 0 ? (
                              app.skills.map((skill, sIdx) => (
                                <span key={sIdx} className="skill-tag">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>None listed</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {/* RESUME LINK BUTTON */}
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', borderColor: '#bfdbfe' }}
                              title="Open candidate resume"
                            >
                              <FileText size={13} />
                              <span>Resume</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <button
                              onClick={() => setInspectCandidate(app)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem' }}
                            >
                              View Bio
                            </button>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-selected">
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => setInspectCandidate(app)}
                              className="btn btn-secondary btn-sm"
                              title="Full Profile"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setStatusUpdate({
                                  status: app.status === 'Applied' ? 'Shortlisted for Test' : 'Shortlisted for Interview',
                                  roundName: 'Technical Round',
                                  remarks: ''
                                });
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              Move
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Create Drive Form */}
      {activeTab === 'new-drive' && (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.5rem' }}>
            Submit Campus Placement Drive Request
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Specify role details, package breakdown, and eligibility engine rules. Sent to TPO for review.
          </p>

          <form onSubmit={handleCreateSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Job Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduate Software Engineer"
                  value={newDrive.jobTitle}
                  onChange={(e) => setNewDrive({ ...newDrive, jobTitle: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Compensation / Package (CTC)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹18.5 LPA"
                  value={newDrive.packageDetails.ctc}
                  onChange={(e) => setNewDrive({
                    ...newDrive,
                    packageDetails: { ...newDrive.packageDetails, ctc: e.target.value }
                  })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description & Responsibilities</label>
              <textarea
                rows={3}
                required
                placeholder="Overview of the role, responsibilities, technical requirements..."
                value={newDrive.jobDescription}
                onChange={(e) => setNewDrive({ ...newDrive, jobDescription: e.target.value })}
                className="form-textarea"
              />
            </div>

            {/* Eligibility Settings */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '0.75rem' }}>
                ELIGIBILITY ENGINE CONFIGURATION
              </h4>

              <div className="form-group">
                <label className="form-label">Eligible Engineering Branches</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {allBranches.map(b => {
                    const isChecked = newDrive.eligibleBranches.includes(b);
                    return (
                      <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBranchToggle(b)}
                        />
                        <span>{b}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newDrive.minimumCgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, minimumCgpa: parseFloat(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Allowed Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={newDrive.allowedBacklogs}
                    onChange={(e) => setNewDrive({ ...newDrive, allowedBacklogs: parseInt(e.target.value, 10) })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="date"
                    value={newDrive.applicationDeadline}
                    onChange={(e) => setNewDrive({ ...newDrive, applicationDeadline: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={creating} className="btn btn-primary" style={{ width: '100%' }}>
              {creating ? 'Submitting to TPO...' : 'Submit Recruitment Drive for TPO Review'}
            </button>
          </form>
        </div>
      )}

      {/* FULL CANDIDATE PROFILE & RESUME MODAL */}
      {inspectCandidate && (
        <div className="modal-overlay" onClick={() => setInspectCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-published" style={{ marginBottom: '0.4rem' }}>
                  Candidate Profile
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  {inspectCandidate.studentName}
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span>Roll: <strong>{inspectCandidate.studentIdCode || inspectCandidate.studentId || '2023CS101'}</strong></span>
                  <span>•</span>
                  <span>Branch: <strong>{inspectCandidate.branch}</strong></span>
                  <span>•</span>
                  <span>Batch: <strong>{inspectCandidate.graduationYear || 2027}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setInspectCandidate(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Academic Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CGPA</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {inspectCandidate.cgpa}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Backlogs</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: inspectCandidate.activeBacklogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {inspectCandidate.activeBacklogs}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '6px' }}>
                  {inspectCandidate.status}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Mail size={15} color="var(--accent-primary)" />
                <span>Email: <strong style={{ color: 'var(--text-main)' }}>{inspectCandidate.studentEmail}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="var(--accent-primary)" />
                <span>Phone: <strong style={{ color: 'var(--text-main)' }}>{inspectCandidate.phone || '+91 98765 43210'}</strong></span>
              </div>
            </div>

            {/* Technical Skills Inventory */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-navy)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                TECHNICAL SKILLS & PROFICIENCIES
              </h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(inspectCandidate.skills || []).length > 0 ? (
                  inspectCandidate.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: 'var(--accent-primary)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.825rem',
                        fontWeight: 700
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No skills recorded in profile.</p>
                )}
              </div>
            </div>

            {/* Resume Document Link */}
            <div style={{ marginBottom: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-navy)' }}>
                    Curriculum Vitae / Resume
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Verified PDF link provided by candidate
                  </div>
                </div>

                <a
                  href={inspectCandidate.resumeUrl || 'https://example.com/sample_resume.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.4rem' }}
                >
                  <FileText size={15} />
                  <span>Open Full Resume</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Application Notes */}
            {inspectCandidate.additionalNotes && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-navy)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  CANDIDATE COVER NOTE
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                  "{inspectCandidate.additionalNotes}"
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={() => setInspectCandidate(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedApplicant(inspectCandidate);
                  setInspectCandidate(null);
                  setStatusUpdate({
                    status: 'Shortlisted for Interview',
                    roundName: 'Technical Interview',
                    remarks: ''
                  });
                }}
                className="btn btn-primary btn-sm"
              >
                Update Recruitment Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Status Update Modal */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.25rem' }}>
              Update Recruitment Outcome
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Candidate: <strong>{selectedApplicant.studentName}</strong> ({selectedApplicant.branch}, CGPA: {selectedApplicant.cgpa})
            </p>

            <div className="form-group">
              <label className="form-label">Outcome / New Status</label>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                className="form-select"
              >
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted for Test">Shortlisted for Test</option>
                <option value="Test Completed">Test Completed</option>
                <option value="Shortlisted for Interview">Shortlisted for Interview</option>
                <option value="Interview Completed">Interview Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Selected">Selected (Release Offer)</option>
                <option value="Not Selected">Not Selected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Round Title</label>
              <input
                type="text"
                placeholder="e.g. Technical Round 1, System Design"
                value={statusUpdate.roundName}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, roundName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Feedback / Remarks</label>
              <textarea
                rows={3}
                placeholder="Interview observations, test score, next instructions..."
                value={statusUpdate.remarks}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApplicantStatus}
                disabled={updatingCandidate}
                className="btn btn-primary btn-sm"
              >
                {updatingCandidate ? 'Saving...' : 'Save & Notify Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
