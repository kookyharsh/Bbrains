import { Server } from "socket.io";
import prisma from "../../utils/prisma.js";
import { insertChatMessage, getMessageById, updateChatMessage, deleteChatMessage } from '../../lib/supabase-chat.js';
import { findUserBySupabaseId } from "../user/user.service.js";
import supabase from "../../utils/supabase.js";

let activeUsers = {};
const mentionPattern = /@([a-zA-Z0-9_]+)/g;
const DEFAULT_CHAT_ROOM = "default";
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

const normalizeChatRoom = (value) => {
    const room = String(value || DEFAULT_CHAT_ROOM).trim();
    if (!room) return DEFAULT_CHAT_ROOM;
    return room.slice(0, 120);
};

const extractSocketToken = (socket) => {
    const handshakeToken = socket.handshake?.auth?.token;
    if (typeof handshakeToken === "string" && handshakeToken.trim()) {
        return handshakeToken.trim();
    }

    const authorizationHeader = socket.handshake?.headers?.authorization;
    if (typeof authorizationHeader === "string" && authorizationHeader.startsWith("Bearer ")) {
        return authorizationHeader.slice("Bearer ".length).trim();
    }

    return "";
};

const loadChatIdentity = async (userId, dbUser = null) => {
    const user = dbUser || await prisma.user.findUnique({
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

const authenticateSocketUser = async (socket) => {
    const token = extractSocketToken(socket);
    if (!token) {
        throw new Error("Missing authentication token");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        throw new Error("Invalid authentication token");
    }

    const dbUser = await findUserBySupabaseId(user.id);
    if (!dbUser) {
        throw new Error("Authenticated user was not found in the application database");
    }

    return await loadChatIdentity(dbUser.id, dbUser);
};

const getPresenceForRoom = (roomName) => {
    return Object.values(activeUsers)
        .filter((entry) => entry.roomName === roomName)
        .map(({ roomName: _roomName, ...member }) => member);
};

const emitPresence = (io, roomName) => {
    io.to(roomName).emit("chat:presence", getPresenceForRoom(roomName));
};

export const initChatSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: true, // Allow any origin in development
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const identity = await authenticateSocketUser(socket);
            if (!identity) {
                next(new Error("Unable to load chat identity"));
                return;
            }

            socket.data.user = identity;
            next();
        } catch (error) {
            console.error("chat socket authentication failed", error);
            next(new Error(error instanceof Error ? error.message : "Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("chat:join", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                if (!identity) {
                    socket.emit("chat:error", { message: "Authentication required before joining chat" });
                    return;
                }

                const roomName = normalizeChatRoom(payload.chatId);
                const previousRoom = socket.data.roomName;

                if (previousRoom && previousRoom !== roomName) {
                    socket.leave(previousRoom);
                    delete activeUsers[socket.id];
                    emitPresence(io, previousRoom);
                }

                socket.join(roomName);
                socket.data.roomName = roomName;
                activeUsers[socket.id] = { ...identity, socketId: socket.id, roomName };
                emitPresence(io, roomName);
            } catch (error) {
                console.error("chat:join failed", error);
                socket.emit("chat:error", { message: "Failed to join chat" });
            }
        });

        socket.on("chat:send", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const roomName = socket.data.roomName;
                const content = String(payload.content || "").trim();
                if (!identity) {
                    socket.emit("chat:error", { message: "Authentication required before sending messages" });
                    return;
                }
                if (!roomName) {
                    socket.emit("chat:error", { message: "Join a chat room before sending messages" });
                    return;
                }
                if (!content) return;

                const payloadToStore = {
                    chat_id: roomName,
                    user_id: identity.userId,
                    username: identity.username,
                    displayName: identity.displayName,
                    avatar: identity.avatar,
                    role: identity.type,
                    content,
                    mentions: extractMentions(content),
                }
                if (payload.replyToMessageId) {
                    const original = await getMessageById(payload.replyToMessageId);
                    if (original) {
                        if (original.chatId !== roomName) {
                            socket.emit("chat:error", { message: "Replies must stay within the same chat room" });
                            return;
                        }

                        payloadToStore.replyTo = original.id;
                    }
                }

                const message = await insertChatMessage(payloadToStore);
                if (message) {
                    io.to(roomName).emit("chat:new", message);
                } else {
                    socket.emit("chat:error", { message: "Failed to save message" });
                }
            } catch (error) {
                console.error("chat:send failed", error);
                socket.emit("chat:error", { message: "Failed to send message" });
            }
        });

        socket.on("chat:edit", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const roomName = socket.data.roomName;
                const messageId = String(payload.messageId || "");
                const content = String(payload.content || "").trim();

                if (!identity || !roomName || !messageId || !content) return;

                const existingMessage = await getMessageById(messageId);
                if (!existingMessage || existingMessage.chatId !== roomName) {
                    socket.emit("chat:error", { message: "Message not found in the active chat room" });
                    return;
                }

                if (existingMessage.userId !== identity.userId) {
                    socket.emit("chat:error", { message: "You can only edit your own messages" });
                    return;
                }

                const updated = await updateChatMessage(messageId, {
                    content,
                    mentions: extractMentions(content),
                });
                if (updated) {
                    io.to(roomName).emit("chat:edited", updated);
                } else {
                    socket.emit("chat:error", { message: "Failed to edit message" });
                }
            } catch (error) {
                console.error("chat:edit failed", error);
                socket.emit("chat:error", { message: "Failed to edit message" });
            }
        });

        socket.on("chat:delete", async (payload = {}) => {
            try {
                const identity = socket.data.user;
                const roomName = socket.data.roomName;
                const messageId = String(payload.messageId || "");
                if (!identity || !roomName || !messageId) return;

                const existingMessage = await getMessageById(messageId);
                if (!existingMessage || existingMessage.chatId !== roomName) {
                    socket.emit("chat:error", { message: "Message not found in the active chat room" });
                    return;
                }

                if (existingMessage.userId !== identity.userId) {
                    socket.emit("chat:error", { message: "You can only delete your own messages" });
                    return;
                }

                const ok = await deleteChatMessage(messageId);
                if (ok) {
                    io.to(roomName).emit("chat:deleted", { messageId });
                } else {
                    socket.emit("chat:error", { message: "Failed to delete message" });
                }
            } catch (error) {
                console.error("chat:delete failed", error);
                socket.emit("chat:error", { message: "Failed to delete message" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            const roomName = activeUsers[socket.id]?.roomName;
            delete activeUsers[socket.id];
            if (roomName) {
                emitPresence(io, roomName);
            }
        });
    });

    return io;
};
