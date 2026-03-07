import express from 'express';
import {
    getAllUsers,
    updateUser,
    getSystemStats,
    getAllBatches,
    createBatch,
    deleteBatch,
    getAllStudents,
    enrollNewStudent,
    deleteUser,
    getAllTeachers
} from '../controllers/adminController';
import { authenticate, authorizeRole } from '../middlewares/auth';

const router = express.Router();

// Strict Admin Only Access
router.use(authenticate);
router.use(authorizeRole('SUPER_ADMIN'));

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// System Management
router.get('/system-stats', getSystemStats);

// Batches
router.get('/batches', getAllBatches);
router.post('/batches', createBatch);
router.delete('/batches/:id', deleteBatch);

// Students
router.get('/students', getAllStudents);
router.post('/students/enroll', enrollNewStudent);

// Teachers
router.get('/teachers', getAllTeachers);

export default router;
