import prisma from "../../utils/prisma.js";
import jwt from 'jsonwebtoken'
import { deleteSupabaseUser } from '../auth/supabase-user.service.js';

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

const findUserBySupabaseId = async (supabaseId, email) => {
    const include = {
        roles: {
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        }
    };

    const byId = await prisma.user.findUnique({
        where: { id: supabaseId },
        include
    });
    if (byId) return byId;

    if (!email) return null;

    return await prisma.user.findUnique({
        where: { email },
        include
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
        select: {
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
                    bio: true
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
            }
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

// Assuming 'createTeacher' creates a user with type 'teacher'
// We can reuse 'createUser' but might need to enforce the role.
// For now, let's just use the existing createUser but exposed specifically or allow type override
const createTeacher = async (data) => {
    return await prisma.user.create({
        data: {
            id: data.id,
            username: data.username,
            email: data.email,
            ...(data.password != null && { password: data.password }),
            collegeId: data.collegeId,
            type: 'teacher',
            userDetails: {
                create: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    sex: data.sex,
                    dob: new Date(data.dob),
                    phone: data.phone ?? null
                }
            }
        }
    });
};

const deleteUser = async (userId) => {
    try {
        await deleteSupabaseUser(userId);
        
        const user = await prisma.user.delete({
            where: { id: userId }
        });
        return user;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export { findUserByEmail, findUserBySupabaseId, createUser, getUserDetailsByID, getUserDataHandler, getUsersByRole, getUserByName, createTeacher, deleteUser };
