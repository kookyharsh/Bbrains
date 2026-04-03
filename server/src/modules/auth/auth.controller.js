import bcrypt from "bcrypt";
import { z } from "zod";
import { findUserByEmail, createUser, getUserDetailsByID } from "../user/user.service.js";
import dotenv from "dotenv";
import { generateToken } from "../../utils/tokengen.js";
import { getRandomAvatar } from "../../utils/randomavatar.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { isDatabaseUnavailableError } from "../../utils/prisma-errors.js";
import crypto from "crypto";
import prisma from "../../utils/prisma.js";

dotenv.config();

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric with underscores"),
  email: z.string().email("Invalid email format").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  collegeId: z.number().int().positive().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const register = async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const userExists = await findUserByEmail(validated.email);
    if (userExists) {
      return sendError(res, "User already exists", 409);
    }

    const collegeId = validated.collegeId || 45;
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const userId = crypto.randomUUID();

    const newUser = await createUser(
      userId,
      validated.username,
      validated.email,
      collegeId,
      hashedPassword,
      getRandomAvatar()
    );

    await createAuditLog(newUser.id, 'AUTH', 'REGISTER', 'User', newUser.id);

    return sendCreated(res, { id: newUser.id, username: newUser.username }, "User registered successfully.");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    if (isDatabaseUnavailableError(error)) {
      console.error('Registration database connectivity error:', error);
      return sendError(res, 'Database temporarily unavailable. Please try again in a moment.', 503);
    }
    console.error(error);
    return sendError(res, "Registration failed", 500);
  }
};

const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await findUserByEmail(validated.email);
    if (!user || !user.password) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      type: user.type
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    const userData = await getUserDetailsByID(user.id);

    await createAuditLog(user.id, 'AUTH', 'LOGIN', 'User', user.id);

    return sendSuccess(res, { user: userData, token }, "Login successful");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    if (isDatabaseUnavailableError(error)) {
      console.error('Login database connectivity error:', error);
      return sendError(res, 'Database temporarily unavailable. Please try again in a moment.', 503);
    }
    console.error(error);
    return sendError(res, "Login failed", 500);
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict"
  });

  return sendSuccess(res, null, "Logged out successfully");
};

const updatePassword = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }

    const validated = passwordUpdateSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.password) {
      return sendError(res, "User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(validated.currentPassword, user.password);
    if (!isPasswordValid) {
      return sendError(res, "Current password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    await createAuditLog(req.user.id, 'AUTH', 'PASSWORD_UPDATE', 'User', req.user.id);

    return sendSuccess(res, null, "Password updated successfully");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    if (isDatabaseUnavailableError(error)) {
      console.error('Password update database connectivity error:', error);
      return sendError(res, 'Database temporarily unavailable. Please try again in a moment.', 503);
    }
    console.error(error);
    return sendError(res, "Password update failed", 500);
  }
};

export { register, login, logout, updatePassword };
