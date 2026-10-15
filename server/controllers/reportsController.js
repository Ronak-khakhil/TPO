import { store } from '../data/store.js';

export const getPlacementStats = async (req, res) => {
  try {
    const drives = store.collection('drives').find();
    const students = store.collection('students').find();
    const applications = store.collection('applications').find();
    const results = store.collection('results').find();
    const companies = store.collection('companies').find();

    const totalStudents = students.length || 1;
    const totalDrives = drives.length;
    const activeDrives = drives.filter(d => d.status === 'published').length;
    const completedDrives = drives.filter(d => d.status === 'completed').length;
    const pendingDrives = drives.filter(d => d.status === 'pendingApproval').length;

    const totalApplications = applications.length;
    const shortlistedCount = applications.filter(a =>
      ['Shortlisted for Test', 'Shortlisted for Interview', 'Selected'].includes(a.status)
    ).length;

    // Total Offers vs Unique Students Placed
    const selectedResults = results.filter(r => r.finalStatus === 'Selected');
    const totalOffers = selectedResults.length;

    const uniquePlacedStudentIds = new Set(selectedResults.map(r => r.studentId));
    const uniqueStudentsPlaced = uniquePlacedStudentIds.size;

    const placementRate = ((uniqueStudentsPlaced / totalStudents) * 100).toFixed(1);

    // Branch-wise breakdown
    const branchStats = {};
    students.forEach(s => {
      const b = s.branch || 'Unknown';
      if (!branchStats[b]) {
        branchStats[b] = { branch: b, total: 0, placed: 0, offers: 0 };
      }
      branchStats[b].total += 1;
    });

    selectedResults.forEach(r => {
      const b = r.branch || 'Unknown';
      if (!branchStats[b]) {
        branchStats[b] = { branch: b, total: 0, placed: 0, offers: 0 };
      }
      branchStats[b].offers += 1;
    });

    // Count unique per branch
    uniquePlacedStudentIds.forEach(id => {
      const st = students.find(s => s._id === id);
      if (st && branchStats[st.branch]) {
        branchStats[st.branch].placed += 1;
      }
    });

    // Company breakdown
    const companyStats = {};
    drives.forEach(d => {
      const c = d.companyName || 'Unknown';
      if (!companyStats[c]) {
        companyStats[c] = { company: c, drives: 0, applicants: 0, hires: 0, topPackage: d.packageDetails?.ctc || 'N/A' };
      }
      companyStats[c].drives += 1;
    });

    applications.forEach(a => {
      const c = a.companyName || 'Unknown';
      if (companyStats[c]) companyStats[c].applicants += 1;
    });

    selectedResults.forEach(r => {
      const c = r.companyName || 'Unknown';
      if (companyStats[c]) companyStats[c].hires += 1;
    });

    res.json({
      summary: {
        totalCompanies: companies.length,
        totalDrives,
        activeDrives,
        pendingDrives,
        completedDrives,
        totalApplications,
        shortlistedCount,
        totalOffers,
        uniqueStudentsPlaced,
        totalGraduatingStudents: totalStudents,
        placementRatePercentage: placementRate
      },
      branchMetrics: Object.values(branchStats),
      companyMetrics: Object.values(companyStats),
      recentResults: selectedResults.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error compiling placement statistics: ' + err.message });
  }
};

export const exportPlacementsCSV = async (req, res) => {
  try {
    const results = store.collection('results').find({ finalStatus: 'Selected' });

    let csv = 'Student Name,Roll Number,Email,Branch,Company,Job Title,Package Offered,Offer Status,Published Date\n';

    for (const r of results) {
      const st = store.collection('students').findById(r.studentId);
      const row = [
        `"${r.studentName || ''}"`,
        `"${st?.studentId || ''}"`,
        `"${r.studentEmail || ''}"`,
        `"${r.branch || ''}"`,
        `"${r.companyName || ''}"`,
        `"${r.jobTitle || ''}"`,
        `"${r.packageOffered || ''}"`,
        `"${r.offerStatus || 'Pending'}"`,
        `"${new Date(r.publishedAt).toLocaleDateString()}"`
      ];
      csv += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="college_placement_report_2026.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed: ' + err.message });
  }
};
