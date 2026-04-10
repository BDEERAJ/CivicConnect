import Problem from '../models/Problem.js';

class VoteService {
    async toggleUpvote(problemId, userId) {
        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error('Problem not found');

        const hasUpvoted = problem.upvotes.includes(userId);

        if (hasUpvoted) {
            // Undo upvote
            problem.upvotes.pull(userId);
        } else {
            // Add upvote, and ensure they are removed from downvotes
            problem.upvotes.addToSet(userId);
            problem.downvotes.pull(userId);
        }
        await problem.save();
        return problem;
    }
    async toggledownvote(problemId, userId) {
        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error('Problem not found');

        const hasUpvoted = problem.downvotes.includes(userId);

        if (hasUpvoted) {
            problem.downvotes.pull(userId); 
        } else {
            // Add upvote, and ensure they are removed from downvotes
            problem.upvotes.pull(userId);
            problem.downvotes.addToSet(userId);
        }
        await problem.save();
        return problem;
    }
}

export default new VoteService();