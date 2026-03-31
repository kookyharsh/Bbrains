import prisma from '../../utils/prisma.js';
import { createNotification } from '../notification/notification.service.js';

const normalizeDate = (value) => {
    const dt = new Date(value);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

export const getAttendanceRecords = async (userId, startDate, endDate) => {
    return await prisma.attendance.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
};

export const getAttendanceByFilters = async (filters) => {
    const { userId, studentId, startDate, endDate, status } = filters;
    const where = {};

    if (userId || studentId) {
        where.userId = userId || studentId;
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    if (status) {
        where.status = status;
    }

    return await prisma.attendance.findMany({
        where,
        include: {
            marker: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            date: 'desc',
        },
    });
};

export const getAttendanceForDate = async (date) => {
    const normalizedDate = normalizeDate(date);

    return await prisma.attendance.findMany({
        where: {
            date: normalizedDate,
        },
        include: {
            marker: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const markAttendanceForStudent = async (studentId, date, status, markedBy, notes) => {
    const dt = normalizeDate(date);

    // Use upsert to simplify
    const existing = await prisma.attendance.findFirst({
        where: { userId: studentId, date: dt }
    });

    const result = existing 
        ? await prisma.attendance.update({
            where: { id: existing.id },
            data: { status, markedBy, notes }
          })
        : await prisma.attendance.create({
            data: {
                userId: studentId,
                date: dt,
                status,
                markedBy,
                notes
            }
          });

    // Notify student
    const dateStr = dt.toLocaleDateString();
    await createNotification(
        studentId,
        'Attendance Marked',
        `Your attendance for ${dateStr} has been marked as ${status}.`,
        'attendance',
        result.id.toString()
    );

    return result;
};

export const markAttendanceForStudents = async (studentIds, date, status, markedBy) => {
    const dt = normalizeDate(date);

    const ids = Array.from(new Set((studentIds || []).map((id) => String(id).trim()).filter(Boolean)));
    if (ids.length === 0) return [];

    const existingRecords = await prisma.attendance.findMany({
        where: {
            userId: { in: ids },
            date: dt,
        },
        select: {
            id: true,
            userId: true,
        },
    });

    const existingByUserId = new Map(existingRecords.map((record) => [record.userId, record]));

    const results = await prisma.$transaction(
        ids.map((studentId) => {
            const existing = existingByUserId.get(studentId);

            if (existing) {
                return prisma.attendance.update({
                    where: { id: existing.id },
                    data: {
                        status,
                        markedBy,
                    },
                });
            }

            return prisma.attendance.create({
                data: {
                    userId: studentId,
                    date: dt,
                    status,
                    markedBy,
                },
            });
        })
    );

    const dateStr = dt.toLocaleDateString();
    await Promise.all(
        ids.map((studentId) =>
            createNotification(
                studentId,
                'Attendance Marked',
                `Your attendance for ${dateStr} has been marked as ${status}.`,
                'attendance'
            )
        )
    );

    return results;
};
