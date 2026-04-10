import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // 👈 Import bcrypt here

class AuthService {
    generateToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }

    async registerUser(userData) {
        const { username, email, password } = userData;
        
        const userExists = await User.findOne({ email });
        if (userExists) throw new Error('User already exists');

        const usernameExists = await User.findOne({ username });
        if (usernameExists) throw new Error('Username already exists');

        // 1. Hash the password explicitly right before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Save the hashed password to the database
        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        return {
            _id: user._id,
            username: user.username,
            token: this.generateToken(user._id)
        };
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        // 3. Compare the typed password with the hashed password explicitly
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        return {
            _id: user._id,
            username: user.username,
            token: this.generateToken(user._id)
        };
    }
}

export default new AuthService();