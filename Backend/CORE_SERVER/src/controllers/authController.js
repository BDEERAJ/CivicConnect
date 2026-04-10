import authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const userData = await authService.registerUser(req.body);
        res.status(201).json(userData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await authService.loginUser(email, password);
        res.status(200).json(userData);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};