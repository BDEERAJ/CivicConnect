import userService from '../services/userService.js';
import chatService from '../services/chatService.js';

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params; // Grabs the user ID from the URL
        
        const profileData = await userService.getUserProfile(id);
        
        res.status(200).json(profileData.user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getCurrentProfile = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const profileData = await userService.getUserProfile(currentUserId);

        res.status(200).json(profileData.user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get chat history between current user and another user
export const getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.user.id; // Comes from the token (protect middleware)
        const { id: otherUserId } = req.params; // Comes from the URL parameter

        const messages = await chatService.getChatHistory(currentUserId, otherUserId);
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch the list of chat contacts for the sidebar
export const getChatContacts = async (req, res) => {
    try {
        const currentUserId = req.user.id; // Automatically grabbed from the JWT token
        
        const contacts = await chatService.getChatContacts(currentUserId);
        
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};