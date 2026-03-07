import { Request, Response } from 'express';
import Batch from '../models/Batch';
import BatchContent from '../models/BatchContent';
import Test from '../models/Test';
import TestResult from '../models/TestResult';
import User from '../models/User';

/**
 * Get all batches assigned to the current teacher
 */
export const getMyBatches = async (req: any, res: Response) => {
    try {
        const teacherId = req.user.id;
        const batches = await Batch.findAll({
            where: { teacherId },
            include: ['course']
        });
        res.json(batches);
    } catch (error) {
        console.error('Fetch my batches error:', error);
        res.status(500).json({ message: 'Error fetching batches' });
    }
};

/**
 * Get content for a specific batch (Teacher version)
 */
export const getBatchData = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params;
        const contents = await BatchContent.findAll({ where: { batchId } });
        const tests = await Test.findAll({ where: { batchId } });
        res.json({ contents, tests });
    } catch (error) {
        console.error('Fetch batch data error:', error);
        res.status(500).json({ message: 'Error fetching batch data' });
    }
};

/**
 * Add content (Video/Assignment/Resource)
 */
export const addBatchContent = async (req: Request, res: Response) => {
    try {
        const { batchId, title, description, type, contentUrl } = req.body;
        const content = await BatchContent.create({
            batchId, title, description, type, contentUrl
        });
        res.status(201).json(content);
    } catch (error) {
        console.error('Add batch content error:', error);
        res.status(500).json({ message: 'Error adding content' });
    }
};

/**
 * Create a new Test
 */
export const createTest = async (req: Request, res: Response) => {
    try {
        const { batchId, title, description, totalMarks, durationMinutes, questions } = req.body;
        const test = await Test.create({
            batchId, title, description, totalMarks, durationMinutes, questions
        });
        res.status(201).json(test);
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ message: 'Error creating test' });
    }
};

/**
 * Analysis: Get all results for a test
 */
export const getTestResults = async (req: Request, res: Response) => {
    try {
        const { testId } = req.params;
        const results = await TestResult.findAll({
            where: { testId },
            include: [{ model: User, as: 'student', attributes: ['name', 'email'] }]
        });
        res.json(results);
    } catch (error) {
        console.error('Fetch test results error:', error);
        res.status(500).json({ message: 'Error fetching analysis' });
    }
};
