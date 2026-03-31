import { getAttendanceByFilters, getAttendanceForDate, markAttendanceForStudent, markAttendanceForStudents } from './attendance.service.js';
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

export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return sendError(res, 'Date is required', 400);
        }

        const records = await getAttendanceForDate(date);
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch attendance for the selected date', 500);
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

export const markAttendanceBulk = async (req, res) => {
    try {
        const { studentIds, date, status } = req.body;
        const markedBy = req.user.id;

        if (!Array.isArray(studentIds) || studentIds.length === 0 || !date || !status) {
            return sendError(res, 'Missing required fields', 400);
        }

        const records = await markAttendanceForStudents(studentIds, date, status, markedBy);
        return sendSuccess(res, records, 'Attendance updated');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to mark attendance in bulk', 500);
    }
};
