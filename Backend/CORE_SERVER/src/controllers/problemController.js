import problemService from '../services/problemService.js';
import voteService from '../services/voteService.js';

export const createProblem = async (req, res) => {
    try {
        const problem = await problemService.createProblem(req.body, req.user.id);
        res.status(201).json(problem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getProblems = async (req, res) => {
    try {
        const problems = await problemService.getAllProblems(req.query);
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const problem = await problemService.getProblemById(req.params.id);
        res.status(200).json(problem);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getMyProblems = async (req, res) => {
    try {
        const myProblems = await problemService.getProblemsByAuthor(req.user.id);
        res.status(200).json(myProblems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleUpvote = async (req, res) => {
    try {
        const problem = await voteService.toggleUpvote(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: problem.upvotes.length, downvotes: problem.downvotes.length });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const toggledownvote = async (req, res) => {
    try {
        const problem = await voteService.toggledownvote(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: problem.upvotes.length, downvotes: problem.downvotes.length });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body; // Expects { "status": "Resolved" } from frontend
        const { id } = req.params;
        
        const updatedProblem = await problemService.updateProblemStatus(id, status);
        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};