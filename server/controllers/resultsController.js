import { store } from '../data/store.js';

export const publishResult = async (req, res) => {
  try {
    const { driveId, applicationId, packageOffered, finalStatus } = req.body;
    const user = req.user;

    if (user.role !== 'tpo' && user.role !== 'company') {
      return res.status(403).json({ message: 'Only TPO and authorized recruiters can publish results.' });
    }

    const application = store.collection('applications').findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    const drive = store.collection('drives').findById(driveId || application.driveId);
    const student = store.collection('students').findById(application.studentId);

    // Update application status to Selected
    store.collection('applications').update(applicationId, {
      status: 'Selected',
      currentRound: 'Offer Released'
    });

    // Check if result record already exists
    const existing = store.collection('results').findOne({ applicationId });
    let resultRecord;

    if (existing) {
      resultRecord = store.collection('results').update(existing._id, {
        packageOffered: packageOffered || drive.packageDetails?.ctc || 'As per offer letter',
        finalStatus: finalStatus || 'Selected',
        publishedAt: new Date().toISOString(),
        publishedBy: user.name
      });
    } else {
      resultRecord = store.collection('results').insert({
        driveId: drive._id,
        applicationId,
        companyId: drive.companyId,
        companyName: drive.companyName,
        studentId: student._id,
        userId: application.userId,
        studentName: student.fullName,
        studentEmail: student.email,
        branch: student.branch,
        jobTitle: drive.jobTitle,
        packageOffered: packageOffered || drive.packageDetails?.ctc || 'As per offer letter',
        finalStatus: finalStatus || 'Selected',
        offerStatus: 'Pending',
        publishedAt: new Date().toISOString(),
        publishedBy: user.name
      });
    }

    // Blast celebration notification to student
    store.collection('notifications').insert({
      recipientUserId: application.userId,
      recipientRole: 'student',
      title: `🎉 Congratulations! Offer Received from ${drive.companyName}`,
      message: `You have been selected for ${drive.jobTitle} with CTC ${resultRecord.packageOffered}. Please review and respond to the offer.`,
      type: 'result',
      driveId: drive._id,
      read: false
    });

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'RESULT_PUBLISHED',
      entityType: 'PlacementResult',
      entityId: resultRecord._id,
      details: `Placement offer published for ${student.fullName} at ${drive.companyName} (${resultRecord.packageOffered}).`
    });

    res.status(201).json({
      message: 'Placement result published successfully!',
      result: resultRecord
    });
  } catch (err) {
    res.status(500).json({ message: 'Result publication failed: ' + err.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const results = store.collection('results').find();
    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch results: ' + err.message });
  }
};

export const respondToOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body; // 'Accepted' | 'Declined'

    if (!['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ message: 'Response must be Accepted or Declined.' });
    }

    const result = store.collection('results').findById(id);
    if (!result) return res.status(404).json({ message: 'Result record not found.' });

    if (result.userId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to respond to this offer.' });
    }

    const updated = store.collection('results').update(id, {
      offerStatus: response,
      respondedAt: new Date().toISOString()
    });

    // Update application status
    if (result.applicationId) {
      store.collection('applications').update(result.applicationId, {
        status: response === 'Accepted' ? 'Offer Accepted' : 'Offer Declined'
      });
    }

    // Audit log
    store.collection('auditLogs').insert({
      actorUserId: req.user._id,
      actorName: req.user.name,
      actorRole: 'student',
      action: `OFFER_${response.toUpperCase()}`,
      entityType: 'PlacementResult',
      entityId: id,
      details: `${req.user.name} has ${response.toLowerCase()} the offer from ${result.companyName}.`
    });

    res.json({ message: `Offer successfully ${response.toLowerCase()}.`, result: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error processing offer response: ' + err.message });
  }
};
