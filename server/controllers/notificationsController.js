import { store } from '../data/store.js';

export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const all = store.collection('notifications').find();

    const filtered = all.filter(n => {
      if (n.recipientUserId === user._id) return true;
      if (user.role === 'student' && n.recipientUserId === 'ALL_STUDENTS') return true;
      if (user.role === 'tpo' && n.recipientRole === 'tpo') return true;
      return false;
    });

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving notifications: ' + err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = store.collection('notifications').findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });

    const updated = store.collection('notifications').update(id, { read: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification: ' + err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const user = req.user;
    const all = store.collection('notifications').find();

    all.forEach(n => {
      if (n.recipientUserId === user._id || (user.role === 'student' && n.recipientUserId === 'ALL_STUDENTS')) {
        store.collection('notifications').update(n._id, { read: true });
      }
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications: ' + err.message });
  }
};
