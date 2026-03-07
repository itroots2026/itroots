import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Batch from '../models/Batch';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { Op } from 'sequelize';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Exclude passwords from returning to front-end
        });
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Server error during fetching users' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role, isActive, name, email, phone } = req.body;

        const user = await User.findByPk(id as string);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) (user as any).role = role;
        if (isActive !== undefined) (user as any).isActive = isActive;
        if (name) (user as any).name = name;
        if (email) (user as any).email = email;
        if (phone !== undefined) (user as any).phone = phone;

        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error during updating user' });
    }
};

export const getSystemStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.count();
        const totalStudents = await User.count({ where: { role: 'STUDENT' } });
        const totalTeachers = await User.count({ where: { role: 'TEACHER' } });
        const totalBatches = await Batch.count();

        res.json({
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalBatches,
                systemStatus: 'Optimal',
                uptime: process.uptime(),
            },
        });
    } catch (error) {
        console.error('System Stats error:', error);
        res.status(500).json({ message: 'Server error fetching system stats' });
    }
};

/**
 * BATCH MANAGEMENT
 */
export const getAllBatches = async (req: Request, res: Response) => {
    try {
        const batches = await Batch.findAll({
            include: [
                { model: Course, as: 'course' },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
            ]
        });
        res.json(batches);
    } catch (error) {
        console.error('Fetch batches error:', error);
        res.status(500).json({ message: 'Error fetching batches' });
    }
};

export const createBatch = async (req: Request, res: Response) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json(batch);
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ message: 'Error creating batch' });
    }
};

export const deleteBatch = async (req: Request, res: Response) => {
    try {
        await Batch.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ message: 'Error deleting batch' });
    }
};

/**
 * STUDENT MANAGEMENT
 */
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where: any = { role: 'STUDENT' };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const students = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Batch,
                    as: 'enrolledBatches',
                    through: { attributes: [] },
                    include: [{ model: Course, as: 'course', attributes: ['title'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(students);
    } catch (error) {
        console.error('Fetch students error:', error);
        res.status(500).json({ message: 'Server error fetching students' });
    }
};

export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where: any = { role: 'TEACHER' };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const teachers = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(teachers);
    } catch (error) {
        console.error('Fetch teachers error:', error);
        res.status(500).json({ message: 'Server error fetching teachers' });
    }
};

export const enrollNewStudent = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, batchId } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create New User if doesn't exist
            const hashedPassword = await bcrypt.hash(password || 'Student@123', 10);
            user = await User.create({
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'STUDENT',
                isActive: true
            });
        }

        // 2. Enroll in Batch
        if (batchId) {
            const existingEnrollment = await Enrollment.findOne({
                where: { studentId: user.id, batchId }
            });

            if (!existingEnrollment) {
                await Enrollment.create({
                    studentId: user.id,
                    batchId,
                    enrollmentDate: new Date(),
                    status: 'ACTIVE'
                });
            }
        }

        res.status(201).json({
            message: 'Student enrolled successfully',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Enroll student error:', error);
        res.status(500).json({ message: 'Server error during enrollment' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id as string);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error during user deletion' });
    }
};
