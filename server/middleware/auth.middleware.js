import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { findUserBySupabaseId } from '../modules/user/user.service.js';
import supabase from '../utils/supabase.js';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? authHeader.substring(0, 50) + '...' : 'none');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token:', token.substring(0, 30) + '...');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.log('Supabase auth error:', error?.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (!user) {
      console.log('No user returned from Supabase');
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const supabaseUserId = user.id;
    console.log('Supabase user ID:', supabaseUserId);

    const dbUser = await findUserBySupabaseId(supabaseUserId);

    if (!dbUser) {
      console.log('User not found in database for Supabase ID:', supabaseUserId);
      return res.status(403).json({ 
        success: false, 
        message: 'User is authenticated with Supabase but not provisioned in the local database. Please contact an administrator.' 
      });
    }

    req.user = dbUser;
    req.supabaseUser = user;
    console.log('User authenticated:', dbUser.username);
    next();
  } catch (error) {
    console.error('Supabase authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication' });
  }
};

export default verifyToken;
