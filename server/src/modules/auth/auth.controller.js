import bcrypt from "bcrypt";
import { z } from "zod";
import { findUserByEmail, createUser, getUserDetailsByID } from "../user/user.service.js";
import dotenv from "dotenv";
import { generateToken } from "../../utils/tokengen.js";
import { getRandomAvatar } from "../../utils/randomavatar.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import supabase from "../../utils/supabase.js";

dotenv.config();

const SUPABASE_INVITE_REDIRECT_URL = process.env.SUPABASE_INVITE_REDIRECT_URL || "http://localhost:3000/auth/confirm";

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

const register = async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const userExists = await findUserByEmail(validated.email);
    if (userExists) {
      return sendError(res, "User already exists", 409);
    }

    const collegeId = validated.collegeId || 45;

    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        username: validated.username
      }
    });

    if (supabaseError) {
      console.error('Supabase user creation error:', supabaseError);
      return sendError(res, "Failed to create user in authentication system", 500);
    }

    const supabaseUserId = supabaseUser.user.id;

    const newUser = await createUser(
      supabaseUserId,
      validated.username,
      validated.email,
      collegeId,
      validated.password,
      getRandomAvatar()
    );

    await createAuditLog(newUser.id, 'AUTH', 'REGISTER', 'User', newUser.id);

    return sendCreated(res, { id: newUser.id, username: newUser.username }, "User registered successfully.");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    console.error(error);
    return sendError(res, "Registration failed", 500);
  }
};

const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password
    });

    if (supabaseError || !supabaseData.user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const user = await findUserByEmail(validated.email);
    if (!user) {
      return sendError(res, "User not found in database. Please contact an administrator.", 404);
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

    return sendSuccess(res, { user: userData, supabaseToken: supabaseData.session.access_token }, "Login successful");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
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

export { register, login, logout };
