import express from "express";
import verifyToken from "../../middleware/auth.middleware.js";
import { getChatMembers, getChatMessages, getMyChatProfile } from "./chat.controller.js";

const router = express.Router();

router.get("/messages", verifyToken, getChatMessages);
router.get("/members", verifyToken, getChatMembers);
router.get("/me", verifyToken, getMyChatProfile);

export default router;

