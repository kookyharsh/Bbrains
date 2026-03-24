// Re-export the existing verifyToken middleware from auth.middleware.js
// so existing imports like ../../middleware/verifyToken.js continue to work.
export { default } from './auth.middleware.js';
