import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });

    res.render('auditLogs', { logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err.message);
    res.status(500).send('Server Error');
  }
};
