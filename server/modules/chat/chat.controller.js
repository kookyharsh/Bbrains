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
        userId: user.id,
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
        const messages = await getMessagesForChat(req.query.chatId) // chatId optional
        const sliced = messages.slice(-limit);
        return sendSuccess(res, sliced);
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

export const getMyChatProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
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

