import jwt from 'jsonwebtoken';
import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
    try {
        const { category, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Feedback message is required.' });
        }

        let userId = null;
        const authHeader = req.header('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (error) {
                // Invalid token is not fatal for anonymous feedback.
            }
        }

        const feedback = await Feedback.create({
            category: category || 'General',
            message: message.trim(),
            user: userId
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
