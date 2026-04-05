import prisma from "../../utils/prisma.js";
import { createNotification } from "../notification/notification.service.js";
import { awardXpToUser } from "../xp/xp.service.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { getAllCourses, getCourseById } from "../course/course.service.js";

const normalizePositiveInteger = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return Math.floor(parsed);
};

const normalizeDueDate = (value) => {
    const date = value ? new Date(value) : new Date();
    date.setHours(23, 59, 59, 999);
    return date;
};

const normalizeReviewStatus = (value) => {
    const status = String(value ?? "").trim().toLowerCase();
    return status === "completed" || status === "incomplete" ? status : "submitted";
};

const assignmentListInclude = {
    course: {
        select: {
            id: true,
            name: true,
            standard: true,
            collegeId: true,
        }
    },
    createdBy: {
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
    _count: {
        select: {
            submissions: true,
        }
    }
};

const getAccessibleTeacherCourseIds = async (currentUser) => {
    const { courses } = await getAllCourses(0, 500, "", currentUser);
    return courses.map((course) => Number(course.id));
};

const getAssignmentWithAccess = async (assignmentId, currentUser, action = "manage this assignment") => {
    const assignment = await prisma.assignment.findUnique({
        where: { id: Number(assignmentId) },
        include: {
            course: {
                select: {
                    id: true,
                    collegeId: true,
                },
            },
        },
    });

    if (!assignment) {
        throw new NotFoundError("Assignment");
    }

    if (!currentUser) {
        throw new ForbiddenError();
    }

    if (currentUser.collegeId && assignment.course?.collegeId !== currentUser.collegeId) {
        throw new ForbiddenError("You do not have access to this assignment");
    }

    if (currentUser.type === "admin" || currentUser.type === "manager") {
        return assignment;
    }

    if (currentUser.type === "teacher") {
        if (assignment.createdById && assignment.createdById === currentUser.id) {
            return assignment;
        }

        await getCourseById(assignment.courseId, currentUser);
        return assignment;
    }

    if (currentUser.type === "student") {
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                courseId: assignment.courseId,
                userId: currentUser.id,
            },
            select: { userId: true },
        });

        if (!enrollment) {
            throw new ForbiddenError(`You can only ${action} for assignments in your enrolled classes`);
        }

        return assignment;
    }

    throw new ForbiddenError();
};

const mapSubmissionNotificationType = "grade";

// --- Assignments ---

const createAssignment = async (currentUser, courseId, data) => {
    const normalizedCourseId = normalizePositiveInteger(courseId);
    await getCourseById(normalizedCourseId, currentUser);

    const assignment = await prisma.assignment.create({
        data: {
            title: data.title,
            description: data.description,
            content: data.content,
            file: data.file,
            dueDate: normalizeDueDate(data.dueDate),
            courseId: normalizedCourseId,
            createdById: currentUser.id,
            rewardPoints: normalizePositiveInteger(data.rewardPoints),
        },
        include: assignmentListInclude,
    });

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId: normalizedCourseId },
        select: { userId: true },
    });

    await Promise.all(
        enrollments.map((enrollment) =>
            createNotification(
                enrollment.userId,
                "New Assignment Available",
                `${assignment.title} has been assigned${assignment.rewardPoints > 0 ? ` for ${assignment.rewardPoints} points` : ""}.`,
                "grade",
                String(assignment.id)
            )
        )
    );

    return assignment;
};

const getAssignments = async (courseId, currentUser) => {
    const normalizedCourseId = Number.isInteger(courseId) ? courseId : null;

    if (!currentUser) {
        return [];
    }

    if (currentUser.type === "student") {
        const where = {
            ...(normalizedCourseId ? { courseId: normalizedCourseId } : {}),
            course: {
                collegeId: currentUser.collegeId,
                enrollments: {
                    some: {
                        userId: currentUser.id,
                    },
                },
            },
        };

        return await prisma.assignment.findMany({
            where,
            include: assignmentListInclude,
            orderBy: { createdAt: "desc" },
        });
    }

    if (currentUser.type === "teacher") {
        const accessibleCourseIds = await getAccessibleTeacherCourseIds(currentUser);
        if (accessibleCourseIds.length === 0) {
            return [];
        }

        const where = {
            course: {
                collegeId: currentUser.collegeId,
            },
            courseId: normalizedCourseId ?? { in: accessibleCourseIds },
            OR: [
                { createdById: currentUser.id },
                { createdById: null },
            ],
        };

        return await prisma.assignment.findMany({
            where,
            include: assignmentListInclude,
            orderBy: { createdAt: "desc" },
        });
    }

    const where = normalizedCourseId
        ? {
            courseId: normalizedCourseId,
            course: { collegeId: currentUser.collegeId },
        }
        : {
            course: { collegeId: currentUser.collegeId },
        };

    return await prisma.assignment.findMany({
        where,
        include: assignmentListInclude,
        orderBy: { createdAt: "desc" },
    });
};

const submitAssignment = async (currentUser, data) => {
    if (currentUser.type !== "student") {
        throw new ForbiddenError("Only students can submit assignments");
    }

    const assignmentId = normalizePositiveInteger(data.assignmentId);
    const filePath = String(data.fileUrl || data.filePath || "").trim();
    const content = data.content || null;

    if (!filePath) {
        throw new Error("A file upload is required");
    }

    const assignment = await getAssignmentWithAccess(assignmentId, currentUser, "submit this assignment");

    const existing = await prisma.submission.findFirst({
        where: { assignmentId, userId: currentUser.id },
        select: {
            id: true,
            reviewStatus: true,
            xpAwardedAt: true,
        }
    });

    if (existing?.reviewStatus === "completed") {
        throw new Error("This assignment has already been marked completed");
    }

    const submission = existing
        ? await prisma.submission.update({
            where: { id: existing.id },
            data: {
                filePath,
                content,
                submittedAt: new Date(),
                reviewStatus: "submitted",
                reviewRemark: null,
                reviewedAt: null,
                reviewedBy: null,
            },
            include: {
                reviewer: {
                    select: {
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
        })
        : await prisma.submission.create({
            data: {
                userId: currentUser.id,
                assignmentId,
                filePath,
                content,
            },
            include: {
                reviewer: {
                    select: {
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
        });

    if (assignment.createdById) {
        await createNotification(
            assignment.createdById,
            "New Assignment Submission",
            `${currentUser.username} submitted work for "${assignment.title}".`,
            mapSubmissionNotificationType,
            String(assignment.id)
        );
    }

    return submission;
};

const getSubmissions = async (assignmentId, currentUser) => {
    await getAssignmentWithAccess(assignmentId, currentUser, "view submissions for this assignment");

    return await prisma.submission.findMany({
        where: { assignmentId: parseInt(assignmentId, 10) },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
            reviewer: {
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
        orderBy: { submittedAt: "desc" },
    });
};

const getMySubmissions = async (userId) => {
    return await prisma.submission.findMany({
        where: { userId },
        include: {
            reviewer: {
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
            assignment: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    dueDate: true,
                    file: true,
                    rewardPoints: true,
                    courseId: true,
                    course: {
                        select: {
                            name: true,
                            standard: true,
                        },
                    },
                },
            },
        },
        orderBy: { submittedAt: "desc" },
    });
};

const reviewSubmission = async (submissionId, currentUser, payload) => {
    if (currentUser.type !== "teacher" && currentUser.type !== "admin" && currentUser.type !== "manager") {
        throw new ForbiddenError("Only teachers can review submissions");
    }

    const submission = await prisma.submission.findUnique({
        where: { id: Number(submissionId) },
        include: {
            assignment: {
                include: {
                    course: {
                        select: {
                            collegeId: true,
                        },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    if (!submission) {
        throw new NotFoundError("Submission");
    }

    await getAssignmentWithAccess(submission.assignmentId, currentUser, "review this assignment submission");

    const reviewStatus = normalizeReviewStatus(payload.reviewStatus);
    if (reviewStatus === "submitted") {
        throw new Error("Review status must be completed or incomplete");
    }

    const reviewRemark = payload.reviewRemark?.trim() || null;
    const now = new Date();
    const shouldAwardXp =
        reviewStatus === "completed"
        && !submission.xpAwardedAt
        && normalizePositiveInteger(submission.assignment.rewardPoints) > 0;

    const updatedSubmission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
            reviewStatus,
            reviewRemark,
            reviewedAt: now,
            reviewedBy: currentUser.id,
            ...(shouldAwardXp ? { xpAwardedAt: now } : {}),
        },
        include: {
            user: {
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
            reviewer: {
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
    });

    if (shouldAwardXp) {
        await awardXpToUser(submission.userId, normalizePositiveInteger(submission.assignment.rewardPoints));
    }

    const message = reviewStatus === "completed"
        ? `Your submission for "${submission.assignment.title}" was marked completed.${submission.assignment.rewardPoints > 0 ? ` You earned ${submission.assignment.rewardPoints} points.` : ""}${reviewRemark ? ` Remark: ${reviewRemark}` : ""}`
        : `Your submission for "${submission.assignment.title}" was marked incomplete.${reviewRemark ? ` Remark: ${reviewRemark}` : " Please review the task and resubmit it."}`;

    await createNotification(
        submission.userId,
        reviewStatus === "completed" ? "Assignment Completed" : "Assignment Needs Rework",
        message,
        mapSubmissionNotificationType,
        String(submission.assignmentId)
    );

    return updatedSubmission;
};

// --- Announcements ---

const createAnnouncement = async (userId, data, authCollegeId) => {
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
    reviewSubmission,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
};
