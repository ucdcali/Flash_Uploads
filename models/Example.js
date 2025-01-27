import mongoose from 'mongoose';
import AuditLog from './AuditLog.js';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,  // Store image file name
    default: null,
  },
});

// Log CREATE operations
exampleSchema.post('save', async function (doc) {
  await AuditLog.create({
    action: 'CREATE',
    collectionName: 'Example',
    documentId: doc._id,
    changes: doc,
    performedBy: 'system',  // Replace with actual user info if available
  });
});

// Log UPDATE operations
exampleSchema.post('findOneAndUpdate', async function (doc) {
  const updates = this.getUpdate();

  // Check if updates exist and prevent empty logs
  if (updates && Object.keys(updates).length > 0) {
    await AuditLog.create({
      action: 'UPDATE',
      collectionName: 'Example',
      documentId: doc._id,
      changes: updates,
      performedBy: 'system',  // Replace with actual user info if available
    });
  }
});

// Log DELETE operations
exampleSchema.post('findOneAndUpdate', async function (doc) {
  const updates = this.getUpdate();
  if (updates && updates.deleted === true) {
    await AuditLog.create({
      action: 'DELETE',
      collectionName: 'Example',
      documentId: doc._id,
      performedBy: 'system',  // Replace with actual user info if available
    });
  }
});

// Log RESTORE operations
exampleSchema.post('findOneAndUpdate', async function (doc) {
  const updates = this.getUpdate();
  if (updates && updates.deleted === false) {
    await AuditLog.create({
      action: 'RESTORE',
      collectionName: 'Example',
      documentId: doc._id,
      performedBy: 'system',  // Replace with actual user info if available
    });
  }
});

const Example = mongoose.model('Example', exampleSchema);

export default Example;
