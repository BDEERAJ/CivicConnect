import problemService from '../services/problemService.js';

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { problemId } = req.params;
        const comment = await problemService.addComment(problemId, req.user.id, text);
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};