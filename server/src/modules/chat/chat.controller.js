import prisma from "../../utils/prisma.js";
import { sendError, sendSuccess } from "../../utils/response.js";
import { z } from "zod";

const DEFAULT_CHAT_ROOM = "default";
const MAX_CHAT_ID_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

const pronounBySex = {
    male: "he/him",
    female: "she/her",
    other: "they/them"
};

const attachmentSchema = z.object({
    url: z.string().url().max(2000),
    type: z.string().min(1).max(120),
    name: z.string().max(255).optional(),
});

const createMessageSchema = z.object({
    content: z.string().max(MAX_MESSAGE_LENGTH).optional().default(""),
    chatId: z.string().trim().min(1).max(MAX_CHAT_ID_LENGTH).optional(),
    mentions: z.array(z.string().trim().min(1).max(64)).max(50).optional(),
    replyTo: z.string().trim().min(1).max(100).optional().nullable(),
    attachments: z.array(attachmentSchema).max(10).optional(),
}).superRefine((payload, ctx) => {
    const hasText = String(payload.content || "").trim().length > 0;
    const hasAttachments = Array.isArray(payload.attachments) && payload.attachments.length > 0;

    if (!hasText && !hasAttachments) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["content"],
            message: "Message must include text or at least one attachment",
        });
    }
});

const updateMessageSchema = z.object({
    content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
    mentions: z.array(z.string().trim().min(1).max(64)).max(50).optional(),
});

const normalizeChatId = (value, req = null) => {
    const defaultRoom = req?.user?.collegeId ? `global_${req.user.collegeId}` : DEFAULT_CHAT_ROOM;
    let explicitId = String(value || "").trim();
    if (!explicitId || explicitId === "default") {
        explicitId = defaultRoom;
    }
    return explicitId && explicitId !== "default" ? explicitId.slice(0, MAX_CHAT_ID_LENGTH) : defaultRoom;
};

const normalizeMentions = (mentions = []) => {
    if (!Array.isArray(mentions)) return [];

    return Array.from(new Set(
        mentions
            .map((entry) => String(entry ?? "").trim().replace(/^@/, "").toLowerCase())
            .filter(Boolean)
    ));
};

const normalizeProfile = (user) => {
    const detail = user.userDetails || {};
    const firstName = detail.firstName || "";
    const lastName = detail.lastName || "";
    const displayName = `${firstName} ${lastName}`.trim() || user.username;
    const grade = user.enrollments?.find((item) => item.grade)?.grade || "N/A";
    const customRoles = (user.roles || []).map((item) => item.role?.name).filter(Boolean);
    const roles = customRoles.length ? customRoles : [user.type];

    return {
        id: user.id,
        username: user.username,
        displayName,
        avatar: detail.avatar || "",
        pronouns: pronounBySex[detail.sex] || "they/them",
        grade,
        roles,
        type: user.type
    };
};

const normalizeMessageRecord = (msg) => {
    const user = msg.user;
    const details = user?.userDetails || {};
    const firstName = details.firstName || "";
    const lastName = details.lastName || "";
    const liveDisplayName = `${firstName} ${lastName}`.trim() || user?.username;

    return {
        id: msg.id,
        userId: msg.userId,
        username: user?.username || msg.username,
        displayName: liveDisplayName || msg.displayName,
        avatar: details.avatar || msg.avatar,
        role: user?.type || msg.role,
        content: msg.content,
        mentions: msg.mentions,
        replyToMessageId: msg.replyTo,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
    };
};

export const getChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10), 1), 500);
        const chatId = normalizeChatId(req.query.chatId, req);
        const before = req.query.before;

        const whereClause = { chatId };

        if (before) {
            whereClause.createdAt = {
                lt: new Date(before)
            };
        }
        
        const messages = await prisma.chatMessage.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
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
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        
        // Reverse so they are in chronological order
        messages.reverse();

        // Normalize for frontend - use live user data if available, fallback to denormalized
        const normalized = messages.map(normalizeMessageRecord);

        return sendSuccess(res, normalized);
    } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        return sendError(res, "Failed to fetch chat messages", 500);
    }
};

export const searchChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10), 1), 100);
        const chatId = normalizeChatId(req.query.chatId, req);
        const query = String(req.query.q || "").trim();

        if (!query) {
            return sendSuccess(res, []);
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                chatId,
                OR: [
                    { content: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                    { displayName: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                user: {
                    select: {
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
            orderBy: { createdAt: "desc" },
            take: limit
        });

        return sendSuccess(res, messages.reverse().map(normalizeMessageRecord));
    } catch (error) {
        console.error("Failed to search chat messages:", error);
        return sendError(res, "Failed to search chat messages", 500);
    }
};

export const getChatMembers = async (req, res) => {
    try {
        const where = req.user?.collegeId
            ? { collegeId: req.user.collegeId }
            : undefined;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        sex: true
                    }
                },
                enrollments: {
                    select: { grade: true },
                    take: 5
                },
                roles: {
                    select: {
                        role: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { username: "asc" }
        });
        
        const members = users.map(normalizeProfile);
        return sendSuccess(res, members);
    } catch (error) {
        console.error("Failed to fetch chat members:", error);
        return sendError(res, "Failed to fetch chat members", 500);
    }
};

export const createChatMessage = async (req, res) => {
    try {
        const validated = createMessageSchema.parse(req.body ?? {});
        const content = String(validated.content || "").trim();
        const chatId = normalizeChatId(validated.chatId, req);
        const mentions = normalizeMentions(validated.mentions);
        const replyTo = validated.replyTo ? String(validated.replyTo).trim() : null;
        const attachments = validated.attachments || [];
        const userId = req.user.id;

        // Fetch user profile for denormalized storage
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { userDetails: true }
        });

        if (!user) return sendError(res, "User not found", 404);

        const profile = normalizeProfile(user);

        if (replyTo) {
            const parentMessage = await prisma.chatMessage.findUnique({
                where: { id: replyTo },
                select: {
                    id: true,
                    chatId: true,
                },
            });
            if (!parentMessage) return sendError(res, "Reply target was not found", 404);
            if (parentMessage.chatId !== chatId) {
                return sendError(res, "Replies must stay within the same chat room", 400);
            }
        }

        const message = await prisma.chatMessage.create({
            data: {
                content,
                chatId,
                userId,
                username: profile.username,
                displayName: profile.displayName,
                avatar: profile.avatar,
                role: profile.type,
                mentions,
                replyTo,
                attachments
            }
        });

        return sendSuccess(res, message, "Message sent", 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return sendError(
                res,
                "Validation failed",
                400,
                error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
            );
        }
        console.error("Failed to create chat message:", error);
        return sendError(res, "Failed to send message", 500);
    }
};

export const updateChatMessageById = async (req, res) => {
    try {
        const messageId = String(req.params.id || "");
        const validated = updateMessageSchema.parse(req.body ?? {});
        const mentions = normalizeMentions(validated.mentions);

        if (!messageId) return sendError(res, "Message ID is required", 400);

        const existingMessage = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                userId: true,
            },
        });
        if (!existingMessage) return sendError(res, "Message not found", 404);
        if (existingMessage.userId !== req.user.id) {
            return sendError(res, "You can only edit your own messages", 403);
        }

        const updated = await prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                content: validated.content,
                mentions,
                updatedAt: new Date(),
            },
        });

        return sendSuccess(res, updated, "Message updated");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return sendError(
                res,
                "Validation failed",
                400,
                error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
            );
        }
        console.error("Failed to update chat message:", error);
        return sendError(res, "Failed to update message", 500);
    }
};

export const deleteChatMessageById = async (req, res) => {
    try {
        const messageId = String(req.params.id || "");
        if (!messageId) return sendError(res, "Message ID is required", 400);

        const existingMessage = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                userId: true,
            },
        });
        if (!existingMessage) return sendError(res, "Message not found", 404);
        if (existingMessage.userId !== req.user.id) {
            return sendError(res, "You can only delete your own messages", 403);
        }

        await prisma.chatMessage.delete({
            where: { id: messageId },
        });

        return sendSuccess(res, null, "Message deleted");
    } catch (error) {
        console.error("Failed to delete chat message:", error);
        return sendError(res, "Failed to delete message", 500);
    }
};

export const getMyChatProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return sendError(res, "Unauthorized", 401);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        sex: true
                    }
                },
                enrollments: {
                    select: { grade: true },
                    take: 5
                },
                roles: {
                    select: {
                        role: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!user) return sendError(res, "User not found", 404);

        return sendSuccess(res, normalizeProfile(user));
    } catch (error) {
        console.error("Failed to fetch my chat profile:", error);
        return sendError(res, "Failed to fetch profile", 500);
    }
};

