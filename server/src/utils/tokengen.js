import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ||"1d" }
  );
};
