import { store } from '../data/store.js';

export const getAuditLogs = async (req, res) => {
  try {
    const logs = store.collection('auditLogs').find();
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving audit trail: ' + err.message });
  }
};
