import { Server } from 'socket.io';
import chatHandler from './chatHandler.js';
import chatService from '../services/chatService.js';

const setupSockets = (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: '*' } // Update this to your frontend URL later
    });

    // In-memory map to track which user is on which socket connection
    // e.g., onlineUsers.get('user_db_id') returns 'socket_id_123'
    const onlineUsers = new Map(); 

    io.on('connection', (socket) => {
        console.log(`🔌 New Socket Connection: ${socket.id}`);

        // Register the user when they connect from the frontend
        socket.on('register_user', async (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`👤 User ${userId} is online`);

            try {
                // 1. Fetch any messages sent while they were offline
                const unreadMessages = await chatService.getUnreadMessages(userId);

                // 2. If they have messages, blast them to the frontend immediately
                if (unreadMessages && unreadMessages.length > 0) {
                    socket.emit('receive_unread_messages', unreadMessages);
                    console.log(`📬 Sent ${unreadMessages.length} offline messages to User ${userId}`);
                }
            } catch (error) {
                console.error('❌ Error fetching unread messages:', error);
            }
        });

        // Pass the socket and tracking map to our dedicated handler (SRP principle)
        chatHandler(io, socket, onlineUsers);

        // Handle disconnect
        socket.on('disconnect', () => {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`💤 User ${userId} went offline`);
                    break;
                }
            }
        });
    });
};

export default setupSockets;