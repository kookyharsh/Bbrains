import prisma from "../../utils/prisma.js";
import { getMessagesForChat, getMessageById, insertChatMessage, updateChatMessage, deleteChatMessage } from "../../lib/supabase-chat.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const pronounBySex = {
    male: "he/him",
    female: "she/her",
    other: "they/them"
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

export const getChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "200"), 10), 1), 500);
        const chatId = req.query.chatId || 'default';
        
        const messages = await prisma.chatMessage.findMany({
            where: { chatId },
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
            orderBy: { createdAt: 'asc' },
            take: -limit // Take the last 'limit' messages
        });
        
        // Normalize for frontend - use live user data if available, fallback to denormalized
        const normalized = messages.map(msg => {
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
        });

        return sendSuccess(res, normalized);
    } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        return sendError(res, "Failed to fetch chat messages", 500);
    }
};

export const getChatMembers = async (req, res) => {
    try {
        console.log("Fetching chat members for user:", req.user?.id);
        
        const users = await prisma.user.findMany({
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

        console.log(`Found ${users.length} users`);
        
        const members = users.map(normalizeProfile);
        return sendSuccess(res, members);
    } catch (error) {
        console.error("Failed to fetch chat members:", error);
        return sendError(res, "Failed to fetch chat members", 500);
    }
};

export const createChatMessage = async (req, res) => {
    try {
        const { content, chatId, mentions, replyTo, attachments } = req.body;
        const userId = req.user.id;

        // Fetch user profile for denormalized storage
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { userDetails: true }
        });

        if (!user) return sendError(res, "User not found", 404);

        const profile = normalizeProfile(user);

        const message = await prisma.chatMessage.create({
            data: {
                content,
                chatId: chatId || 'default',
                userId,
                username: profile.username,
                displayName: profile.displayName,
                avatar: profile.avatar,
                role: profile.type,
                mentions: mentions || [],
                replyTo: replyTo || null,
                attachments: attachments || []
            }
        });

        return sendSuccess(res, message, "Message sent", 201);
    } catch (error) {
        console.error("Failed to create chat message:", error);
        return sendError(res, "Failed to send message", 500);
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

