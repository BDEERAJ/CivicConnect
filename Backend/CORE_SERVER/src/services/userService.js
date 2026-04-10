import User from '../models/User.js';
import Problem from '../models/Problem.js';

class UserService {
    async getUserProfile(userId) {
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        const problems = await Problem.find({ authorId: userId }).sort({ createdAt: -1 });

        return {
            user,
            problems
        };
    }
}

export default new UserService();