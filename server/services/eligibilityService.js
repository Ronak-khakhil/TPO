/**
 * Eligibility Engine based on Section 9 of the Project Specification.
 * Evaluates student academic record against recruitment drive criteria.
 */
export const checkEligibility = (student, drive) => {
  const reasons = [];

  if (!student) {
    return {
      status: 'NEEDS_VERIFICATION',
      reasons: ['No verified student profile found. Please complete your profile.'],
      isEligible: false
    };
  }

  // 1. Branch verification
  if (!student.branch) {
    return {
      status: 'NEEDS_VERIFICATION',
      reasons: ['Student branch is not recorded. Contact TPO for profile update.'],
      isEligible: false
    };
  }

  const eligibleBranches = Array.isArray(drive.eligibleBranches)
    ? drive.eligibleBranches.map(b => b.toUpperCase().trim())
    : [];

  const studentBranch = student.branch.toUpperCase().trim();

  if (eligibleBranches.length > 0 && !eligibleBranches.includes(studentBranch)) {
    reasons.push(
      `Branch '${student.branch}' is not eligible. Required branch(es): ${eligibleBranches.join(', ')}.`
    );
  }

  // 2. CGPA verification
  if (student.cgpa === undefined || student.cgpa === null || isNaN(student.cgpa)) {
    return {
      status: 'NEEDS_VERIFICATION',
      reasons: ['Recorded CGPA is missing. Verification required from TPO office.'],
      isEligible: false
    };
  }

  const minCgpa = parseFloat(drive.minimumCgpa || 0);
  const studentCgpa = parseFloat(student.cgpa);

  if (studentCgpa < minCgpa) {
    reasons.push(
      `Recorded CGPA is ${studentCgpa.toFixed(2)}, which is below the minimum requirement of ${minCgpa.toFixed(2)}.`
    );
  }

  // 3. Backlog verification
  const allowedBacklogs = parseInt(drive.allowedBacklogs !== undefined ? drive.allowedBacklogs : 0, 10);
  const studentBacklogs = parseInt(student.activeBacklogs || 0, 10);

  if (studentBacklogs > allowedBacklogs) {
    reasons.push(
      `Active backlogs (${studentBacklogs}) exceed maximum allowed (${allowedBacklogs}).`
    );
  }

  // 4. Target Batch / Graduation Year verification
  const allowedYears = Array.isArray(drive.graduationYears) && drive.graduationYears.length > 0
    ? drive.graduationYears.map(y => parseInt(y, 10))
    : [];

  if (allowedYears.length > 0 && student.graduationYear) {
    const studentYear = parseInt(student.graduationYear, 10);
    if (!allowedYears.includes(studentYear)) {
      reasons.push(
        `Graduation year ${studentYear} does not match eligible batch (${allowedYears.join(', ')}).`
      );
    }
  }

  // Outcome
  if (reasons.length === 0) {
    return {
      status: 'ELIGIBLE',
      reasons: ['All academic requirements and criteria are satisfied.'],
      isEligible: true
    };
  }

  return {
    status: 'NOT_ELIGIBLE',
    reasons,
    isEligible: false
  };
};
