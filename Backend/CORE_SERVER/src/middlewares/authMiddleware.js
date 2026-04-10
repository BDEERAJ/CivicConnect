import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expects "Bearer <token>"
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info (like user.id) to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};