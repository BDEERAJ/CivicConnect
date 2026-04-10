import express from 'express';
import * as problemController from '../controllers/problemController.js';
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Problems
router.post('/', protect, problemController.createProblem);
router.get('/', problemController.getProblems); // Public route
router.get('/me', protect, problemController.getMyProblems);
router.get('/:id', problemController.getProblemById); // Public route for single problem
router.post('/:id/upvote', protect, problemController.toggleUpvote);
router.post('/:id/downvote', protect, problemController.toggledownvote);


// 👇 NEW: The route to update the status (using PATCH because we are only updating one field)
router.patch('/:id/status', protect, problemController.updateStatus);

router.post('/:problemId/comments', protect, commentController.addComment);

export default router;