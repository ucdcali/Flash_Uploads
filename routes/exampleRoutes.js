import express from 'express';
import * as exampleController from '../controllers/exampleController.js';
import * as auditController from '../controllers/auditController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store uploads in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Rename file with timestamp
  }
});

// File upload filter (only allow image files)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter 
});

// Middleware to make flash messages available in all views
router.use((req, res, next) => {
  res.locals.messages = req.flash();
  console.log('Current flash messages:', res.locals.messages);
  next();
});

// READ: Display all examples
router.get('/', exampleController.getExamples);

// CREATE: Add a new example and upload image
router.post('/', upload.single('image'), exampleController.createExample);

// UPDATE: Update an example
router.post('/edit/:id', upload.single('image'), exampleController.updateExample);

// DELETE: Delete an example
router.post('/delete/:id', exampleController.deleteExample);

// Search examples
router.get('/search', exampleController.searchExamples);

// Aggregate examples
router.get('/aggregate', exampleController.aggregateExamples);

// Route to view deleted examples (trash)
router.get('/trash', exampleController.getDeletedExamples);

// Route to restore a deleted example
router.post('/restore/:id', exampleController.restoreExample);

// Route to permanently delete an example
router.post('/delete/permanent/:id', exampleController.permanentDeleteExample);

// Route to view audit logs
router.get('/audit-logs', auditController.getAuditLogs);

export default router;
