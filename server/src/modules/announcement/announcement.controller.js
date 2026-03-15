import prisma from '../../utils/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { z } from 'zod';

const createAnnouncementSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z.string().optional(),
    image: z.string().optional()
});

export const createAnnouncement = async (req, res, next) => {
    try {
        const { title, description, image } = createAnnouncementSchema.parse(req.body ?? {});
        const userId = req.user?.id; // from auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized missing user id" });
        }
console.log("Creating announcement with:", { userId, title, description, image });
        const announcement = await prisma.announcement.create({
            data: {
                userId,
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
                }
            }
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        return next(err);
    }
};

export const getAllAnnouncements = async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
};

export const deleteAnnouncement = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const announcement = await prisma.announcement.findUnique({
            where: { id }
        });

        if (!announcement) {
            throw new NotFoundError('Announcement not found');
        }

        await prisma.announcement.delete({
            where: { id }
        });

        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
};
