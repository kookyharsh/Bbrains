import { Server } from "socket.io";
import prisma from "../../utils/prisma.js";
import { insertChatMessage, getMessageById, updateChatMessage, deleteChatMessage } from '../../lib/supabase-chat.js';
import jwt from "jsonwebtoken";
import supabase from "../../utils/supabase.js";

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
    const io = new Server(server, {
        cors: {
            origin: true, // Allow any origin in development
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
                // Determine token from payload, auth, cookies, or headers
                let token = payload.token || socket.handshake.auth?.token;

                if (!token && socket.handshake.headers?.cookie) {
                    const cookies = socket.handshake.headers.cookie.split(';');
                    for (const cookie of cookies) {
                        const [name, val] = cookie.trim().split('=');
                        if (name === 'token') {
                            token = val;
                            break;
                        }
                    }
                }

                if (!token && socket.handshake.headers?.authorization) {
                    const authHeader = socket.handshake.headers.authorization;
                    if (authHeader.startsWith('Bearer ')) {
                        token = authHeader.split('Bearer ')[1];
                    }
                }

                if (!token) {
                    socket.emit("chat:error", { message: "Authentication required to join chat" });
                    return;
                }

                let userId = null;

                // Try verifying as JWT first
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                } catch (jwtError) {
                    // Fallback to Supabase verification if JWT fails
                    const { data: { user }, error } = await supabase.auth.getUser(token);
                    if (!error && user) {
                        userId = user.id;
                    }
                }

                if (!userId) {
                    socket.emit("chat:error", { message: "Invalid or expired token" });
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
                // Persist to Supabase-based chat storage
                const payloadToStore = {
                    chat_id: payload.chatId ?? 'default',
                    user_id: identity.userId,
                    username: identity.username,
                    displayName: identity.displayName,
                    avatar: identity.avatar,
                    role: identity.type,
                    content,
                    mentions: extractMentions(content),
                }
                if (payload.replyToMessageId) {
                    const original = await getMessageById(payload.replyToMessageId)
                    if (original) {
                        payloadToStore.replyTo = original.id
                    }
                }
                const message = await insertChatMessage(payloadToStore)
                if (message) {
                    io.emit("chat:new", message)
                } else {
                    socket.emit("chat:error", { message: "Failed to save message" })
                }
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
                const updated = await updateChatMessage(messageId, {
                    content,
                    mentions: extractMentions(content),
                })
                if (updated) {
                    io.emit("chat:edited", updated)
                } else {
                    socket.emit("chat:error", { message: "Failed to edit message" })
                }
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
                const ok = await deleteChatMessage(messageId)
                if (ok) {
                    io.emit("chat:deleted", { messageId })
                } else {
                    socket.emit("chat:error", { message: "Failed to delete message" })
                }
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
