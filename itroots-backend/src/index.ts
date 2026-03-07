import dotenv from 'dotenv';
dotenv.config(); // Must be FIRST — before any module reads process.env

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import sequelize from './config/database';

// Import Routes
import authRoutes from './routes/authRoutes';
import cmsRoutes from './routes/cmsRoutes';
import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import publicRoutes from './routes/publicRoutes';

// Import Models for Sync
import './models/User';
import './models/Course';
import './models/Lead';
import './models/Placement';
import './models/Batch';
import './models/Enrollment';
import './models/BatchContent';
import './models/Test';
import './models/TestResult';
import './models/Attendance';
import './models/Announcement';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Root Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the ITRoots Learning Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            cms: '/api/v1/cms',
            admin: '/api/v1/admin',
            teacher: '/api/v1/teacher',
            student: '/api/v1/student',
            public: '/api/v1/public',
        },
        systemTime: new Date().toISOString()
    });
});

// App Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/public', publicRoutes);

const startServer = async () => {
    try {
        // 1. Connect to Database
        await connectDB();

        // 2. Synchronize Models (alter in dev for schema updates)
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (isDevelopment) {
            await sequelize.sync({ alter: true });
            console.log('✅ Synchronized database models with "alter: true"');
        }

        // 3. Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Final server startup error:', error);
    }
};

startServer();
