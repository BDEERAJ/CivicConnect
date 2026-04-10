import Message from '../models/Message.js';
import User from '../models/User.js';

class ChatService {
    // Saves a message to MongoDB
    async saveMessage(senderId, receiverId, content, isReceiverOnline) {
        const message = new Message({
            senderId,
            receiverId,
            content,
            isRead: isReceiverOnline // If online, mark read. If offline, stays false.
        });
        return await message.save();
    }

    async getUnreadMessages(userId) {
        const messages = await Message.find({ receiverId: userId, isRead: false });
        
        // Mark them as read once fetched
        await Message.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
        
        return messages;
    }

    // Get chat history between two users
    async getChatHistory(currentUserId, otherUserId) {
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first for chronological chat display
        .populate('senderId', 'username')
        .populate('receiverId', 'username');


        return messages;
    }

    // Get a list of unique users this person has chatted with
    async getChatContacts(userId) {
        // 1. Fetch all messages where the user is either the sender OR the receiver
        // Sorting by newest first ensures the most recent chats are processed first
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        // 2. Use a Set to store unique contact IDs (Sets automatically ignore duplicates)
        const uniqueContactIds = new Set();

        messages.forEach(msg => {
            // If I am the sender, the contact is the receiver
            if (msg.senderId.toString() !== userId.toString()) {
                uniqueContactIds.add(msg.senderId.toString());
            }
            // If I am the receiver, the contact is the sender
            if (msg.receiverId.toString() !== userId.toString()) {
                uniqueContactIds.add(msg.receiverId.toString());
            }
        });

        // 3. Fetch the profile details for those unique IDs
        // We use .select() to only send the ID and username (hiding passwords/emails)
        const contacts = await User.find({
            _id: { $in: Array.from(uniqueContactIds) }
        }).select('username _id');

        return contacts;
    }
}

export default new ChatService();