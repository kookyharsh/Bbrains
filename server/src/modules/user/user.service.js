import prisma from "../../utils/prisma.js";
import jwt from 'jsonwebtoken';
import { getRandomAvatar } from "../../utils/randomavatar.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

const findUserByUsername = async (username) => {
    return await prisma.user.findUnique({
        where: { username },
    });
};

const findUserBySupabaseId = async (supabaseId) => {
    return await prisma.user.findUnique({
        where: { id: supabaseId },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });
};

const createUser = async (userId, username, email, collegeId, password, avatar, options = {}) => {
    return await prisma.user.create({
        data: {
            id: userId,
            username,
            email,
            collegeId,
            ...(password != null && { password }),
            userDetails: {
                create: {
                    avatar: avatar ?? null,
                    firstName: options.firstName ?? "",
                    lastName: options.lastName ?? "",
                    sex: options.sex ?? "other",
                    dob: options.dob ? new Date(options.dob) : new Date("2005-07-08"),
                    phone: options.phone ?? "7634928634"
                }
            }
        },
    });
};

const normalizeStringArray = (values = []) => {
    if (!Array.isArray(values)) return [];
    return values
        .map((value) => String(value ?? '').trim())
        .filter(Boolean);
};

const userSummarySelect = {
    id: true,
    username: true,
    email: true,
    type: true,
    userDetails: {
        select: {
            firstName: true,
            lastName: true,
            avatar: true,
            sex: true,
            dob: true,
            phone: true,
            bio: true,
            teacherSubjects: true,
        }
    },
    college: {
        select: {
            id: true,
            name: true,
            features: true
        }
    },
    wallet: {
        select: {
            id: true,
            balance: true,
        },
    },
    xp: {
        select: {
            xp: true,
            level: true,
        },
    },
    roles: {
        select: {
            role: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                }
            }
        }
    },
    enrollments: {
        select: {
            courseId: true,
            course: {
                select: {
                    id: true,
                    name: true,
                    standard: true,
                }
            }
        }
    },
    classTeacherCourse: {
        select: {
            id: true,
            name: true,
            standard: true,
        }
    }
};

const getUserDetailsByID = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            college: {
                select: {
                    name: true,
                    regNo: true,
                },
            },
            userDetails: {
                select: {
                    avatar: true,
                    firstName: true,
                    lastName: true,
                    sex: true,
                    dob: true,
                    phone: true,
                    bio: true,
                    teacherSubjects: true,
                    address: {
                        select: {
                            addressLine1: true,
                            addressLine2: true,
                            city: true,
                            state: true,
                            postalCode: true,
                            country: true,
                        },
                    },
                },
            },
            roles: {
                select: {
                    role: {
                        select: {
                            name: true,
                            description: true,
                        },
                    },
                },
            },
            wallet: {
                select: {
                    id: true,
                    balance: true,
                },
            },
            xp: {
                select: {
                    xp: true,
                    level: true,
                },
            },
            userAchievements: {
                include: {
                    achievement: true
                }
            },
            grades: {
                include: {
                    assignment: {
                        select: {
                            title: true,
                            course: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    gradedAt: 'desc'
                },
                take: 10
            },
            enrollments: {
                select: {
                    courseId: true,
                    course: {
                        select: {
                            id: true,
                            name: true,
                            standard: true,
                        }
                    }
                }
            },
            classTeacherCourse: {
                select: {
                    id: true,
                    name: true,
                    standard: true,
                }
            }
        },
    });

    if (!user) return null;

    // Flatten userDetails properties to the top level
    const { userDetails, ...rest } = user;
    return {
        ...rest,
        ...(userDetails || {})
    };
};

const getUserSummaryByID = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: userSummarySelect,
    });
};

const getUserDataHandler = async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await getUserDetailsByID(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: "Invalid or expired token",
            error: error.message || error
        });
    }
};

const getUsersByRole = async (roleName) => {
    return await prisma.user.findMany({
        where: {
            type: roleName // 'student' or 'teacher' from enum
        },
        select: userSummarySelect,
        orderBy: {
            createdAt: 'desc'
        }
    });

};

const getAllUsersWithRoles = async () => {
    return await prisma.user.findMany({
        select: userSummarySelect,
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const getUserByName = async (name) => {
    return await prisma.user.findFirst({
        where: {
            username: {
                contains: name,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            userDetails: true
        }
    });
};

const ensureRoleByName = async (tx, roleName, description) => {
    const roles = await tx.role.findMany({
        select: {
            id: true,
            name: true,
            description: true,
        }
    });

    const existing = roles.find((role) => role.name.toLowerCase() === roleName.toLowerCase());

    if (existing) return existing;

    return await tx.role.create({
        data: {
            name: roleName,
            description
        }
    });
};

const createManagedUser = async (data) => {
    const {
        username,
        email,
        password,
        collegeId,
        type,
        firstName,
        lastName,
        sex,
        dob,
        phone,
        bio,
        teacherSubjects = [],
        classTeacherCourseId,
        classId,
        assignRoleNames = [],
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    try {
        await prisma.$transaction(async (tx) => {
            await tx.user.create({
                data: {
                    id: userId,
                    username,
                    email,
                    collegeId,
                    type,
                    password: hashedPassword,
                    userDetails: {
                        create: {
                            avatar: getRandomAvatar(),
                            firstName,
                            lastName,
                            sex,
                            dob: new Date(dob),
                            phone: phone ?? null,
                            bio: bio ?? null,
                            ...(type === 'teacher'
                                ? { teacherSubjects: normalizeStringArray(teacherSubjects) }
                                : {}),
                        }
                    },
                    ...(type === 'student'
                        ? {
                            streak: {
                                create: {
                                    currentStreak: 0,
                                }
                            }
                        }
                        : {})
                }
            });

            await tx.xp.upsert({
                where: { userId: userId },
                update: {},
                create: {
                    userId: userId,
                    xp: 0,
                    level: 1,
                }
            });

            await tx.wallet.upsert({
                where: { userId: userId },
                update: {},
                create: {
                    id: `wallet_${userId}`,
                    userId: userId,
                    balance: 500,
                    pin: "000000",
                }
            });

            for (const roleName of assignRoleNames) {
                const role = await ensureRoleByName(
                    tx,
                    roleName,
                    `${roleName} access`
                );

                await tx.userRoles.upsert({
                    where: {
                        userId_roleId: {
                            userId: userId,
                            roleId: role.id,
                        }
                    },
                    create: {
                        userId: userId,
                        roleId: role.id,
                    },
                    update: {},
                });
            }

            if (type === 'student' && classId) {
                const course = await tx.course.findUnique({
                    where: { id: Number(classId) },
                    select: { id: true }
                });

                if (!course) {
                    throw new Error('Selected class was not found');
                }

                await tx.enrollment.create({
                    data: {
                        userId: userId,
                        courseId: course.id,
                    }
                });
            }

            if (type === 'teacher' && classTeacherCourseId) {
                const course = await tx.course.findUnique({
                    where: { id: Number(classTeacherCourseId) },
                    select: {
                        id: true,
                        classTeacherId: true,
                    }
                });

                if (!course) {
                    throw new Error('Selected class teacher assignment was not found');
                }

                if (course.classTeacherId && course.classTeacherId !== userId) {
                    throw new Error('This class already has a class teacher assigned');
                }

                await tx.course.update({
                    where: { id: course.id },
                    data: {
                        classTeacherId: userId,
                    }
                });
            }
        });

        return await getUserSummaryByID(userId);
    } catch (error) {
        throw error;
    }
};

const createTeacher = async (data) => {
    return await createManagedUser({
        ...data,
        type: 'teacher',
        assignRoleNames: [],
    });
};

const createStudent = async (data) => {
    return await createManagedUser({
        ...data,
        type: 'student',
        assignRoleNames: [],
    });
};

const createManager = async (data) => {
    return await createManagedUser({
        ...data,
        type: 'staff',
        assignRoleNames: ['Manager'],
    });
};

const deleteUser = async (userId) => {
    try {
        const user = await prisma.user.delete({
            where: { id: userId }
        });
        return user;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export {
    findUserByEmail,
    findUserBySupabaseId,
    findUserByUsername,
    createUser,
    getUserDetailsByID,
    getUserSummaryByID,
    getUserDataHandler,
    getUsersByRole,
    getAllUsersWithRoles,
    getUserByName,
    createTeacher,
    createStudent,
    createManager,
    deleteUser
};
