import prisma from "../../utils/prisma.js";

// --- Assignments ---

const createAssignment = async (teacherId, courseId, data) => {
    return await prisma.assignment.create({
        data: {
            title: data.title,
            description: data.description,
            content: data.content,
            file: data.file,
            dueDate: new Date(data.dueDate),
            courseId: parseInt(courseId),
        }
    });
};

const getAssignments = async (courseId, collegeId) => {
    const where = Number.isInteger(courseId) 
        ? { courseId } 
        : (collegeId ? { course: { collegeId } } : {});
        
    return await prisma.assignment.findMany({
        where,
        include: {
            course: {
                select: {
                    name: true,
                    collegeId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const submitAssignment = async (userId, data) => {
    const assignmentId = parseInt(String(data.assignmentId), 10);
    const filePath = data.fileUrl || data.filePath || '';
    const content = data.content || null;

    const existing = await prisma.submission.findFirst({
        where: { assignmentId, userId }
    });

    if (existing) {
        return await prisma.submission.update({
            where: { id: existing.id },
            data: {
                filePath,
                content,
                submittedAt: new Date()
            }
        });
    }

    return await prisma.submission.create({
        data: {
            userId,
            assignmentId,
            filePath,
            content
        }
    });
};

const getSubmissions = async (assignmentId) => {
    return await prisma.submission.findMany({
        where: { assignmentId: parseInt(assignmentId) },
        include: { user: { select: { username: true, email: true } } }
    });
};

const getMySubmissions = async (userId) => {
    return await prisma.submission.findMany({
        where: { userId },
        include: { assignment: { select: { id: true, title: true, courseId: true, course: { select: { name: true } } } } }
    });
};

// --- Announcements ---

const createAnnouncement = async (userId, data, authCollegeId) => {
    // If not global, use the author's collegeId
    const collegeId = data.isGlobal ? null : authCollegeId;
    const isGlobal = data.isGlobal === true;
    
    const announcement = await prisma.announcement.create({
        data: {
            userId,
            title: data.title,
            description: data.description,
            image: data.image,
            collegeId,
            isGlobal
        }
    });

    // Log the action
    await prisma.auditLog.create({
        data: {
            user: { connect: { id: userId } },
            category: "ACADEMIC",
            action: "CREATE",
            entity: "Announcement",
            entityId: String(announcement.id)
        }
    });

    return announcement;
};

const getAnnouncements = async (collegeId = null) => {
    const whereClause = collegeId ? {
        OR: [
            { isGlobal: true },
            { collegeId: collegeId }
        ]
    } : { isGlobal: true };

    return await prisma.announcement.findMany({
        where: whereClause,
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
    getMySubmissions,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
};
