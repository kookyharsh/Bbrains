import express from "express";
import verifyToken from "../../middleware/auth.middleware.js";
import {
    getChatMembers,
    getChatMessages,
    searchChatMessages,
    getMyChatProfile,
    createChatMessage,
    updateChatMessageById,
    deleteChatMessageById
} from "./chat.controller.js";

const router = express.Router();

router.get("/messages", verifyToken, getChatMessages);
router.get("/messages/search", verifyToken, searchChatMessages);
router.post("/messages", verifyToken, createChatMessage);
router.put("/messages/:id", verifyToken, updateChatMessageById);
router.delete("/messages/:id", verifyToken, deleteChatMessageById);
router.get("/members", verifyToken, getChatMembers);
router.get("/me", verifyToken, getMyChatProfile);

export default router;

