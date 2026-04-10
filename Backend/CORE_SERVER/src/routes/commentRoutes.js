import express from 'express';
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/:problemId/comments', protect, commentController.addComment);

export default router;