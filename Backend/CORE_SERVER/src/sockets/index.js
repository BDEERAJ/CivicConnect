import { Server } from 'socket.io';
import chatHandler from './chatHandler.js';
import chatService from '../services/chatService.js';

const setupSockets = (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: '*' } 
    });

    const onlineUsers = new Map(); 

    io.on('connection', (socket) => {

        // Register the user when they connect from the frontend
        socket.on('register_user', async (userId) => {
            onlineUsers.set(userId, socket.id);

            try {
                const unreadMessages = await chatService.getUnreadMessages(userId);

                if (unreadMessages && unreadMessages.length > 0) {
                    socket.emit('receive_unread_messages', unreadMessages);
                }
            } catch (error) {
            }
        });

        chatHandler(io, socket, onlineUsers);

        socket.on('disconnect', () => {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });
};

export default setupSockets;