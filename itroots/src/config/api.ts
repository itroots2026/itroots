export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const ENDPOINTS = {
    PUBLIC: {
        CONTACT: `${API_BASE_URL}/public/contact`,
        ENROLL: `${API_BASE_URL}/public/enroll`,
        HIRE: `${API_BASE_URL}/public/hire`,
        COURSES: `${API_BASE_URL}/public/courses`,
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        ME: `${API_BASE_URL}/auth/me`,
    },
    CMS: {
        COURSES: `${API_BASE_URL}/cms/courses`,
        LEADS: `${API_BASE_URL}/cms/leads`,
        PLACEMENTS: `${API_BASE_URL}/cms/placements`,
    },
    ADMIN: {
        USERS: `${API_BASE_URL}/admin/users`,
        STATS: `${API_BASE_URL}/admin/system-stats`,
        BATCHES: `${API_BASE_URL}/admin/batches`,
        STUDENTS: `${API_BASE_URL}/admin/students`,
        ENROLL_STUDENT: `${API_BASE_URL}/admin/students/enroll`,
        TEACHERS: `${API_BASE_URL}/admin/teachers`,
    },
    TEACHER: {
        BASE: `${API_BASE_URL}/teacher`,
        MY_BATCHES: `${API_BASE_URL}/teacher/my-batches`,
        BATCH_DATA: `${API_BASE_URL}/teacher/batch-data`,
        ADD_CONTENT: `${API_BASE_URL}/teacher/batch-content`,
        CREATE_TEST: `${API_BASE_URL}/teacher/tests`,
        TEST_RESULTS: `${API_BASE_URL}/teacher/test-results`,
        ANNOUNCEMENTS: `${API_BASE_URL}/teacher/announcements`,
    },
    STUDENT: {
        BASE: `${API_BASE_URL}/student`,
        AVAILABLE_BATCHES: `${API_BASE_URL}/student/available-batches`,
        SELF_ENROLL: `${API_BASE_URL}/student/self-enroll`,
        MY_LEARNING: `${API_BASE_URL}/student/my-learning`,
        BATCH_RESOURCES: `${API_BASE_URL}/student/batch-resources`,
        SUBMIT_EXAM: `${API_BASE_URL}/student/submit-exam`,
        ATTENDANCE: `${API_BASE_URL}/student/attendance`,
        ANNOUNCEMENTS: `${API_BASE_URL}/student/announcements`,
    }
};
