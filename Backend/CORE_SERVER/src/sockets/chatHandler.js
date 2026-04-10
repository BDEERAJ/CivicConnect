import chatService from '../services/chatService.js';

export default (io, socket, onlineUsers) => {
    
    // When a user sends a private message
    socket.on('send_private_message', async (data) => {
        const { senderId, receiverId, content } = data;

        // Check if the receiver is currently online
        const receiverSocketId = onlineUsers.get(receiverId);
        const isReceiverOnline = !!receiverSocketId;

        try {
            // 1. Save message to database (SOLID Principle: Delegate to Service)
            const savedMessage = await chatService.saveMessage(
                senderId, 
                receiverId, 
                content, 
                isReceiverOnline
            );

            // 2. If online, emit it to them directly
            if (isReceiverOnline) {
                io.to(receiverSocketId).emit('receive_message', savedMessage);
            } else {
                console.log(`📩 User ${receiverId} is offline. Message stored in DB.`);
            }
            
            // 3. Acknowledge back to sender that it was sent successfully
            socket.emit('message_sent_success', savedMessage);

        } catch (error) {
            console.error('Chat Error:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });
};