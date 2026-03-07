import { Server } from "socket.io";
import prisma from "../../utils/prisma.js";
import { hasMongoConnection } from "../../utils/mongo.js";
import ChatMessage from "../../models/chatMessage.model.js";

let activeUsers = {};
const mentionPattern = /@([a-zA-Z0-9_]+)/g;
const pronounBySex = {
    male: "he/him",
    female: "she/her",
    other: "they/them"
};

const extractMentions = (content = "") => {
    const mentions = new Set();
    let match;
    while ((match = mentionPattern.exec(content)) !== null) {
        mentions.add(match[1].toLowerCase());
    }
    return Array.from(mentions);
};

const loadChatIdentity = async (userId) => {
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

    if (!user) return null;

    const firstName = user.userDetails?.firstName || "";
    const lastName = user.userDetails?.lastName || "";
    const displayName = `${firstName} ${lastName}`.trim() || user.username;
    const grade = user.enrollments?.find((item) => item.grade)?.grade || "N/A";
    const customRoles = (user.roles || []).map((item) => item.role?.name).filter(Boolean);
    const roles = customRoles.length ? customRoles : [user.type];

    return {
        userId: user.id,
        username: user.username,
        displayName,
        avatar: user.userDetails?.avatar || "",
        pronouns: pronounBySex[user.userDetails?.sex] || "they/them",
        grade,
        roles,
        type: user.type
    };
};

export const initChatSocket = (server) => {
    const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ].filter(Boolean);

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const emitPresence = () => {
        io.emit("chat:presence", Object.values(activeUsers));
    };

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("chat:join", async (payload = {}) => {
            try {
                const userId = payload.userId;
                if (!userId) {
                    socket.emit("chat:error", { message: "Missing userId in chat:join" });
                    return;
                }

                const identity = await loadChatIdentity(userId);
                if (!identity) {
                    socket.emit("chat:error", { message: "User not found for chat session" });
                    return;
                }

                socket.data.user = identity;
                activeUsers[socket.id] = { ...identity, socketId: socket.id };
                emitPresence();
            } catch (error) {
                console.error("chat:join failed", error);
                socket.emit("chat:error", { message: "Failed to join chat" });
            }
        });

        socket.on("chat:send", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const content = String(payload.content || "").trim();
                if (!identity) {
                    socket.emit("chat:error", { message: "Join chat before sending messages" });
                    return;
                }
                if (!content) return;
                if (!hasMongoConnection()) {
                    socket.emit("chat:error", { message: "Chat database unavailable. Set MONGODB_URI." });
                    return;
                }

                let replyTo = null;
                if (payload.replyToMessageId) {
                    const original = await ChatMessage.findById(payload.replyToMessageId).lean();
                    if (original) {
                        replyTo = {
                            messageId: String(original._id),
                            username: original.username,
                            content: original.content.slice(0, 160)
                        };
                    }
                }

                const message = await ChatMessage.create({
                    userId: identity.userId,
                    username: identity.username,
                    displayName: identity.displayName,
                    avatar: identity.avatar,
                    role: identity.type,
                    content,
                    mentions: extractMentions(content),
                    replyTo
                });

                io.emit("chat:new", message.toObject());
            } catch (error) {
                console.error("chat:send failed", error);
                socket.emit("chat:error", { message: "Failed to send message" });
            }
        });

        socket.on("chat:edit", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const messageId = String(payload.messageId || "");
                const content = String(payload.content || "").trim();

                if (!identity || !messageId || !content) return;
                if (!hasMongoConnection()) {
                    socket.emit("chat:error", { message: "Chat database unavailable. Set MONGODB_URI." });
                    return;
                }

                const existing = await ChatMessage.findById(messageId);
                if (!existing) {
                    socket.emit("chat:error", { message: "Message not found" });
                    return;
                }
                if (existing.userId !== identity.userId) {
                    socket.emit("chat:error", { message: "You can edit only your own messages" });
                    return;
                }

                existing.content = content;
                existing.mentions = extractMentions(content);
                existing.editedAt = new Date();
                await existing.save();

                io.emit("chat:edited", existing.toObject());
            } catch (error) {
                console.error("chat:edit failed", error);
                socket.emit("chat:error", { message: "Failed to edit message" });
            }
        });

        socket.on("chat:delete", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const messageId = String(payload.messageId || "");
                if (!identity || !messageId) return;
                if (!hasMongoConnection()) {
                    socket.emit("chat:error", { message: "Chat database unavailable. Set MONGODB_URI." });
                    return;
                }

                const existing = await ChatMessage.findById(messageId);
                if (!existing) {
                    socket.emit("chat:error", { message: "Message not found" });
                    return;
                }
                if (existing.userId !== identity.userId) {
                    socket.emit("chat:error", { message: "You can delete only your own messages" });
                    return;
                }

                await ChatMessage.deleteOne({ _id: messageId });
                io.emit("chat:deleted", { messageId });
            } catch (error) {
                console.error("chat:delete failed", error);
                socket.emit("chat:error", { message: "Failed to delete message" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            delete activeUsers[socket.id];
            emitPresence();
        });
    });

    return io;
};
