import express from 'express';
import { getProfile, getCurrentProfile, getChatHistory, getChatContacts } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. STATIC ROUTES MUST GO FIRST
// GET /api/users/chat/contacts (Gets the sidebar list of unique people)
router.get('/chat/contacts', protect, getChatContacts);

// GET /api/users/profile (Gets the logged in user's profile)
router.get('/profile', protect, getCurrentProfile);

// 2. DYNAMIC ROUTES GO LAST (Routes with :id)
// GET /api/users/:id/chat (Gets the actual messages between you and one specific person)
router.get('/:id/chat', protect, getChatHistory);

// GET /api/users/:id (Gets a user's public profile)
router.get('/:id', getProfile);

export default router;