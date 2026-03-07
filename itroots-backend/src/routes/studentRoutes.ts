import express from 'express';
import {
    getAvailableBatches,
    selfEnroll,
    getMyLearning,
    getBatchResources,
    submitExamResult
} from '../controllers/studentController';
import { getStudentAttendance } from '../controllers/attendanceController';
import { getStudentAnnouncements } from '../controllers/announcementController';
import { authenticate, authorizeRole } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole('STUDENT')); // Allow Students

router.get('/available-batches', getAvailableBatches);
router.post('/self-enroll', selfEnroll);
router.get('/my-learning', getMyLearning);
router.get('/batch-resources/:batchId', getBatchResources);
router.post('/submit-exam', submitExamResult);

// New features: Attendance & Announcements
router.get('/attendance', getStudentAttendance);
router.get('/announcements', getStudentAnnouncements);

export default router;
