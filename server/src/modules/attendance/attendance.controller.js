import { getAttendanceByFilters, markAttendanceForStudent } from './attendance.service.js';
import authorize from '../../middleware/authorize.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const getAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, status } = req.query;

        const records = await getAttendanceByFilters({ userId, startDate, endDate, status });
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch attendance records', 500);
    }
};

// GET /attendance/student/:studentId
export const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const { startDate, endDate, status } = req.query;

        const records = await getAttendanceByFilters({ studentId, startDate, endDate, status });
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch student attendance', 500);
    }
};

// Admin/Teacher: Mark attendance for a student on a given date
export const markAttendance = async (req, res) => {
    try {
        const { studentId, date, status, notes } = req.body;
        const markedBy = req.user.id;

        if (!studentId || !date || !status) {
            return sendError(res, 'Missing required fields', 400);
        }

        const record = await markAttendanceForStudent(studentId, date, status, markedBy, notes);
        return sendSuccess(res, record, 'Attendance updated');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to mark attendance', 500);
    }
};
