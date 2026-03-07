import express from 'express';
import {
    getMyBatches,
    getBatchData,
    addBatchContent,
    createTest,
    getTestResults
} from '../controllers/teacherController';
import { markAttendance, getBatchAttendance } from '../controllers/attendanceController';
import { createAnnouncement, getBatchAnnouncements } from '../controllers/announcementController';
import { authenticate, authorizeRole } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole('TEACHER')); // Allow Teachers

router.get('/my-batches', getMyBatches);
router.get('/batch-data/:batchId', getBatchData);
router.post('/batch-content', addBatchContent);
router.post('/tests', createTest);
router.get('/test-results/:testId', getTestResults);

// New features: Attendance & Announcements
router.post('/attendance', markAttendance);
router.get('/attendance/:batchId', getBatchAttendance);
router.post('/announcements', createAnnouncement);
router.get('/announcements/:batchId', getBatchAnnouncements);

export default router;
