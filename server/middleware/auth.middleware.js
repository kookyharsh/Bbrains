import { getAuth, clerkClient } from "@clerk/express";
import prisma from "../utils/prisma.js";
import { findUserByClerkId } from "../modules/user/user.service.js";

const verifyToken = async (req, res, next) => {
    try {
        const auth = getAuth(req);

        if (!auth || !auth.userId) {
            console.log("No auth found in request");
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const clerkUserId = auth.userId;
        console.log("Clerk user ID:", clerkUserId);

        // Prisma `User.id` stores Clerk's `user_...` id
        const user = await findUserByClerkId(clerkUserId);

        if (!user) {
            console.log("User not found in database for Clerk ID:", clerkUserId);
            return res.status(403).json({ 
                success: false, 
                message: "User is authenticated with Clerk but not provisioned in the local database. Please contact an administrator." 
            });
        }

        req.user = user;
        console.log("User authenticated:", user.username);
        next();
    } catch (error) {
        console.error("Clerk authentication error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired authentication" });
    }
};

export default verifyToken;
