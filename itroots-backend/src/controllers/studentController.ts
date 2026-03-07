import { Request, Response } from 'express';
import Batch from '../models/Batch';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import BatchContent from '../models/BatchContent';
import Test from '../models/Test';
import TestResult from '../models/TestResult';

/**
 * Get all available batches for the student to select/enroll
 */
export const getAvailableBatches = async (req: Request, res: Response) => {
    try {
        const batches = await Batch.findAll({
            include: ['course', { model: User, as: 'teacher', attributes: ['name'] }]
        });
        res.json(batches);
    } catch (error) {
        console.error('Fetch global batches error:', error);
        res.status(500).json({ message: 'Error fetching global batches' });
    }
};

/**
 * Self Enrollment Handler
 */
export const selfEnroll = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { batchId } = req.body;

        const existing = await Enrollment.findOne({ where: { studentId, batchId } });
        if (existing) {
            return res.status(400).json({ message: 'Already enrolled in this batch' });
        }

        const enrollment = await Enrollment.create({
            studentId,
            batchId,
            enrollmentDate: new Date(),
            status: 'ACTIVE'
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Self enrollment error:', error);
        res.status(500).json({ message: 'Error during enrollment' });
    }
};

/**
 * Get My Active Batches
 */
export const getMyLearning = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const enrollments = await Enrollment.findAll({
            where: { studentId },
            include: [{
                model: Batch,
                as: 'batch',
                include: ['course', { model: User, as: 'teacher', attributes: ['name'] }]
            }]
        });
        res.json(enrollments);
    } catch (error) {
        console.error('Fetch my learning error:', error);
        res.status(500).json({ message: 'Error fetching learning modules' });
    }
};

/**
 * Access Content for an Enrolled Batch
 */
export const getBatchResources = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { batchId } = req.params;

        // Verify enrollment
        const enrollment = await Enrollment.findOne({ where: { studentId, batchId } });
        if (!enrollment) {
            return res.status(403).json({ message: 'Access denied: Enroll in this batch first' });
        }

        const contents = await BatchContent.findAll({ where: { batchId } });
        const tests = await Test.findAll({ where: { batchId } });
        res.json({ contents, tests });
    } catch (error) {
        console.error('Fetch resources error:', error);
        res.status(500).json({ message: 'Error fetching batch materials' });
    }
};

/**
 * Submit Test Answers
 */
export const submitExamResult = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { testId, score, completionTime } = req.body;

        const result = await TestResult.create({
            studentId, testId, score, completionTime, submittedAt: new Date()
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({ message: 'Error submitting test' });
    }
};
