import { getAuth, clerkClient } from "@clerk/express";
import prisma from "../utils/prisma.js";
import { findUserByClerkId } from "../services/user.service.js";

const verifyToken = async (req, res, next) => {
    try {
        const auth = getAuth(req);

        if (!auth || !auth.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const clerkUserId = auth.userId;

        // Prisma `User.id` stores Clerk's `user_...` id
        const user = await findUserByClerkId(clerkUserId);

        if (!user) {
            return res.status(403).json({ success: false, message: "User is authenticated with Clerk but not provisioned in the local database" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Clerk authentication error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired authentication" });
    }
};

export default verifyToken;
