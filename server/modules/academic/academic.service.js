import prisma from "../../utils/prisma.js";

// --- Assignments ---

const createAssignment = async (teacherId, courseId, data) => {
    return await prisma.assignment.create({
        data: {
            title: data.title,
            description: data.description,
            content: data.content,
            dueDate: new Date(data.dueDate),
            courseId: parseInt(courseId),
        }
    });
};

const getAssignments = async (courseId) => {
    const where = Number.isInteger(courseId) ? { courseId } : {};
    return await prisma.assignment.findMany({
        where,
        include: {
            course: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const submitAssignment = async (userId, data) => {
    const assignmentId = parseInt(String(data.assignmentId), 10);
    const filePath = data.fileUrl || data.filePath || '';

    const existing = await prisma.submission.findFirst({
        where: { assignmentId, userId }
    });

    if (existing) {
        return await prisma.submission.update({
            where: { id: existing.id },
            data: {
                filePath,
                submittedAt: new Date()
            }
        });
    }

    return await prisma.submission.create({
        data: {
            userId,
            assignmentId,
            filePath
        }
    });
};

const getSubmissions = async (assignmentId) => {
    return await prisma.submission.findMany({
        where: { assignmentId: parseInt(assignmentId) },
        include: { user: { select: { username: true, email: true } } }
    });
};

// --- Announcements ---

const createAnnouncement = async (userId, data) => {
    const announcement = await prisma.announcement.create({
        data: {
            userId,
            title: data.title,
            description: data.description,
            image: data.image
        }
    });

    // Log the action
    await prisma.auditLog.create({
        data: {
            userId,
            category: "ACADEMIC",
            action: "CREATE",
            entity: "Announcement",
            entityId: String(announcement.id)
        }
    });

    return announcement;
};

const getAnnouncements = async () => {
    return await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
    });
};

const deleteAnnouncement = async (id) => {
    return await prisma.announcement.delete({
        where: { id: parseInt(id) }
    });
};

export {
    createAssignment,
    getAssignments,
    submitAssignment,
    getSubmissions,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
};
