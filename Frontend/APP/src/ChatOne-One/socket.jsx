import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    // The single instance of the socket connection
    this.socket = null;
  }

  /**
   * Initialize the WebSocket connection
   */
  connect() {
    // Only connect if we don't already have an active socket
    if (!this.socket) {
      this.socket = io('https://civicconnect-m1vy.onrender.com', {
        transports: ['websocket'], // Forces WebSockets for better performance
      });

      this.socket.on('connect', () => {
      });

      this.socket.on('connect_error', (err) => {
      });
    }
  }

  /**
   * Disconnect the socket entirely
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Register the user with the backend tracking map
   * @param {string} userId - The database ID of the currently logged-in user
   */
  registerUser(userId) {
    if (this.socket && userId) {
      this.socket.emit('register_user', userId);
    }
  }

  /**
   * Send a private message to another user
   * @param {string} senderId - Your user ID
   * @param {string} receiverId - The recipient's user ID
   * @param {string} content - The message text
   */
  sendPrivateMessage(senderId, receiverId, content) {
    if (this.socket) {
      this.socket.emit('send_private_message', {
        senderId,
        receiverId,
        content
      });
    }
  }

  /**
   * Listen for incoming real-time messages
   * @param {function} callback - Function to run when a new message arrives
   */
  onReceiveMessage(callback) {
    if (this.socket) {
      // We use .off() first to prevent duplicate listeners if React re-renders
      this.socket.off('receive_message'); 
      this.socket.on('receive_message', (message) => {
        callback(message);
      });
    }
  }

  /**
   * Listen for unread messages fetched immediately upon registration
   * @param {function} callback - Function to run with the array of unread messages
   */
  onReceiveUnreadMessages(callback) {
    if (this.socket) {
      this.socket.off('receive_unread_messages');
      this.socket.on('receive_unread_messages', (messages) => {
        callback(messages);
      });
    }
  }

  /**
   * Listen for confirmation that a message was successfully sent and saved
   * @param {function} callback - Function to run with the saved message
   */
  onMessageSentSuccess(callback) {
    if (this.socket) {
      this.socket.off('message_sent_success');
      this.socket.on('message_sent_success', (message) => {
        callback(message);
      });
    }
  }

  /**
   * Listen for errors when attempting to send a message
   * @param {function} callback - Function to run with the error details
   */
  onMessageError(callback) {
    if (this.socket) {
      this.socket.off('message_error');
      this.socket.on('message_error', (error) => {
        callback(error);
      });
    }
  }
}

export default new SocketService();