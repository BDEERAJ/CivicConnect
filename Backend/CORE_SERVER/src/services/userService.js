import User from '../models/User.js';
import Problem from '../models/Problem.js';

class UserService {
    async getUserProfile(userId) {
        // 1. Fetch the user, but use .select('-password') to ensure 
        // the hashed password NEVER gets sent to the frontend.
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }

        // 2. Fetch all problems where the authorId matches this user
        // and sort them by newest first.
        const problems = await Problem.find({ authorId: userId }).sort({ createdAt: -1 });

        // 3. Return a clean, combined object
        return {
            user,
            problems
        };
    }
}

export default new UserService();