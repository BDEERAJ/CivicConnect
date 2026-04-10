import Problem from '../models/Problem.js';
import Comment from '../models/Comment.js';

class ProblemService {
    async createProblem(data, authorId) {
        const problem = new Problem({ ...data, authorId });
        return await problem.save();
    }

    async getAllProblems(filters) {
        let query = {};

        console.log('Filters received in service:', filters);
        if (filters.location) {
            query.location = filters.location; 
        }

        return await Problem.find(query)
            .populate('authorId', 'username')
            .sort({ createdAt: -1 });
    }

    async getProblemById(problemId) {
        const problem = await Problem.findById(problemId)
            .populate('authorId', 'username');
        if (!problem) throw new Error('Problem not found');
        
        // Fetch comments for this problem
        const comments = await Comment.find({ problemId })
            .populate('authorId', 'username')
            .sort({ createdAt: 1 });
        
        return { ...problem.toObject(), comments };
    }

    async getProblemsByAuthor(authorId) {
        return await Problem.find({ authorId })
            .populate('authorId', 'username')
            .sort({ createdAt: -1 });
    }

    // 👇 NEW: Update the status of a problem
    async updateProblemStatus(problemId, newStatus) {
        // Find the problem and update it. 
        // runValidators: true ensures they can only pass 'Pending', 'In Progress', or 'Resolved'
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            { status: newStatus },
            { new: true, runValidators: true } 
        );

        if (!problem) throw new Error("Problem not found");
        return problem;
    }

    async addComment(problemId, authorId, text) {
        const comment = new Comment({ problemId, authorId, text });
        return await comment.save();
    }
}

export default new ProblemService();