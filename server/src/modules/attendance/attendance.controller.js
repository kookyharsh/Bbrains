import { getAttendanceByFilters, getAttendanceForDate, markAttendanceForStudent, markAttendanceForStudents } from './attendance.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === 'number') {
        return error.statusCode;
    }

    return fallbackStatus;
};

export const getAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, status } = req.query;

        const records = await getAttendanceByFilters({ userId, startDate, endDate, status }, req.user);
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch attendance records', getStatusCode(error));
    }
};

// GET /attendance/student/:studentId
export const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const { startDate, endDate, status } = req.query;

        const records = await getAttendanceByFilters({ studentId, startDate, endDate, status }, req.user);
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch student attendance', getStatusCode(error));
    }
};

export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return sendError(res, 'Date is required', 400);
        }

        const records = await getAttendanceForDate(date, req.user);
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch attendance for the selected date', getStatusCode(error));
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

        const record = await markAttendanceForStudent(studentId, date, status, markedBy, notes, req.user);
        return sendSuccess(res, record, 'Attendance updated');
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to mark attendance', getStatusCode(error));
    }
};

export const markAttendanceBulk = async (req, res) => {
    try {
        const { studentIds, date, status } = req.body;
        const markedBy = req.user.id;

        if (!Array.isArray(studentIds) || studentIds.length === 0 || !date || !status) {
            return sendError(res, 'Missing required fields', 400);
        }

        const records = await markAttendanceForStudents(studentIds, date, status, markedBy, req.user);
        return sendSuccess(res, records, 'Attendance updated');
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to mark attendance in bulk', getStatusCode(error));
    }
};
