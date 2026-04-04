import prisma from '../../utils/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { z } from 'zod';

const createAnnouncementSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isGlobal: z.boolean().optional().default(false),
    collegeId: z.number().optional(),
    category: z.string().optional()
});

export const createAnnouncement = async (req, res, next) => {
    try {
        const { title, description, image, isGlobal, collegeId: bodyCollegeId } = createAnnouncementSchema.parse(req.body ?? {});
        const userId = req.user?.id; // from auth middleware
        const userCollegeId = req.user?.collegeId;
        const collegeId = isGlobal ? null : (bodyCollegeId || userCollegeId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized missing user id" });
        }
        
        console.log("Creating announcement with:", { userId, collegeId, title, description, image, isGlobal });
        const announcement = await prisma.announcement.create({
            data: {
                userId,
                collegeId,
                isGlobal,
                title,
                description,
                image
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        type: true,
                        userDetails: {
                            select: {
                                avatar: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                acknowledged: false
            }
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        return next(err);
    }
};

export const getAllAnnouncements = async (req, res, next) => {
    try {
        const collegeId = req.user?.collegeId;
        console.log("getAllAnnouncements called for collegeId:", collegeId);
        
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { collegeId: collegeId },
                    { isGlobal: true }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        type: true,
                        userDetails: {
                            select: {
                                avatar: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                acknowledged: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                userDetails: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log("Announcements fetched:", announcements.length);

        const formattedAnnouncements = announcements.map(ann => ({
            ...ann,
            acknowledgedBy: ann.acknowledged.map(ack => ({
                userId: ack.userId,
                userDetails: ack.user.userDetails ? {
                    firstName: ack.user.userDetails.firstName,
                    lastName: ack.user.userDetails.lastName
                } : undefined,
                createdAt: ack.createdAt.toISOString()
            }))
        }));

        res.status(200).json({ success: true, data: formattedAnnouncements });
    } catch (error) {
        console.error("getAllAnnouncements error:", error);
        next(error);
    }
};

export const deleteAnnouncement = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id);
        const announcement = await prisma.announcement.findUnique({
            where: { id: parsedId }
        });

        if (!announcement) {
            throw new NotFoundError('Announcement not found');
        }

        await prisma.announcement.delete({
            where: { id: parsedId }
        });

        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
};

export const acknowledgeAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("acknowledgeAnnouncement called with params:", req.params, "id:", id);
        const parsedId = parseInt(id);
        const userId = req.user?.id;

        if (!id || isNaN(parsedId)) {
            return res.status(400).json({ success: false, message: "Invalid announcement ID" });
        }

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const announcement = await prisma.announcement.findUnique({
            where: { id: parsedId }
        });

        if (!announcement) {
            throw new NotFoundError('Announcement not found');
        }

        const existingAck = await prisma.acknowledged.findFirst({
            where: {
                announcementId: parsedId,
                userId
            }
        });

        if (existingAck) {
            return res.status(200).json({ success: true, message: "Already acknowledged" });
        }

        await prisma.acknowledged.create({
            data: {
                announcementId: parsedId,
                userId
            }
        });

        const updatedAnnouncement = await prisma.announcement.findUnique({
            where: { id: parsedId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        type: true,
                        userDetails: {
                            select: {
                                avatar: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                acknowledged: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                userDetails: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            success: true, data: {
                ...updatedAnnouncement,
                acknowledgedBy: updatedAnnouncement.acknowledged.map(ack => ({
                    userId: ack.userId,
                    userDetails: ack.user.userDetails ? {
                        firstName: ack.user.userDetails.firstName,
                        lastName: ack.user.userDetails.lastName
                    } : undefined,
                    createdAt: ack.createdAt.toISOString()
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAcknowledgedUsers = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id);

        const acknowledgedUsers = await prisma.acknowledged.findMany({
            where: { announcementId: parsedId },
            include: {
                user: {
                    select: {
                        id: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedUsers = acknowledgedUsers.map(ack => ({
            userId: ack.userId,
            userDetails: ack.user.userDetails ? {
                firstName: ack.user.userDetails.firstName,
                lastName: ack.user.userDetails.lastName
            } : undefined,
            createdAt: ack.createdAt.toISOString()
        }));

        res.status(200).json({ success: true, data: formattedUsers });
    } catch (error) {
        next(error);
    }
};
