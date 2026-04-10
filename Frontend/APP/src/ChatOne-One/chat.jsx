import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; 
const socketService = {
  connect: () => {},
  registerUser: () => {},
  onReceiveMessage: () => {},
  onMessageSentSuccess: () => {},
  onMessageError: () => {},
  sendPrivateMessage: () => {},
  disconnect: () => {}
};



const ChatWindow = () => {
  const { contactId } = useParams();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactName, setContactName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real token and userId for actual authentication
  const token = localStorage.getItem('token');
  const myUserId = localStorage.getItem('userId'); 
  
  const messagesEndRef = useRef(null);

  // 1. Fetch historical chat data from the REST API on load
  useEffect(() => {
    if (!contactId) {
        setLoading(false);
        return;
    }

    const fetchChatHistory = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching contact info for:', contactId);
        // Always try to get contact name (doesn't require auth)
        const contactResponse = await axios.get(`https://civicconnect-m1vy.onrender.com/api/users/${contactId}`);
        console.log('Contact response:', contactResponse.data);
        setContactName(contactResponse.data.username || 'Community Member');
        
        // Only fetch chat history if user is logged in
        if (token) {
          console.log('Fetching chat history with token');
          const response = await axios.get(`https://civicconnect-m1vy.onrender.com/api/users/${contactId}/chat`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Chat history response:', response.data);
          setMessages(response.data || []);
        } else {
          console.log('No token, skipping chat history');
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Could not load messages. The server might be down.');
        setContactName('Unknown');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [contactId, token]);

  // 2. Setup WebSocket real-time connection and listeners
  useEffect(() => {
    if (!token || !myUserId) return;

    // Connect and register the user to the global online map
    socketService.connect();
    socketService.registerUser(myUserId);

    // Listen for incoming messages from the OTHER user
    socketService.onReceiveMessage((incomingMsg) => {
      // Only append if it belongs to the current conversation
      if (incomingMsg.senderId === contactId || incomingMsg.receiverId === contactId) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    });

    // Listen for confirmation that OUR message was sent and saved to the DB
    socketService.onMessageSentSuccess((savedMsg) => {
      if (savedMsg.receiverId === contactId) {
        setMessages((prev) => [...prev, savedMsg]);
      }
    });

    // Listen for transmission errors
    socketService.onMessageError((err) => {
      console.error('Socket error:', err);
      setError(err.error || 'Failed to deliver your last message.');
    });

    // Cleanup: In a real app, you might want to disconnect or remove listeners
    // to prevent memory leaks if navigating away.
    return () => {
      // socketService.disconnect(); // (Optional based on global vs local needs)
    };
  }, [contactId, myUserId, token]);

  // 3. Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Handle Sending a New Message to the WebSocket API
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myUserId) return;

    // Emit the message over the socket connection
    socketService.sendPrivateMessage(myUserId, contactId, newMessage);
    
    // Clear the input box.
    // Notice we do NOT append to the UI immediately here. 
    // We wait for the 'onMessageSentSuccess' event to guarantee it was saved to the DB.
    setNewMessage(''); 
  };

  return (
    <>
      <div className="civic-chatwin-layout">
        <Navbar />

        <div className="civic-chatwin-container">
          
          {/* Header */}
          <div className="civic-chatwin-header">
            <Link to="/chat" className="civic-chatwin-back-btn">←</Link>
            <div className="civic-chatwin-avatar">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <h2 className="civic-chatwin-name">{contactName}</h2>
          </div>

          {/* Messages Area */}
          <div className="civic-chatwin-messages-area">
            
            {loading && <div style={{ textAlign: 'center', color: '#A0AEC0', marginTop: '20px' }}>Loading messages...</div>}
            {error && <div style={{ textAlign: 'center', color: '#ED8936', marginTop: '20px' }}>{error}</div>}
            
            {!loading && messages.length === 0 && !error && (
              <div style={{ textAlign: 'center', color: '#A0AEC0', marginTop: '40px' }}>
                No messages yet. Send a message to start the conversation!
              </div>
            )}

            {messages.map((msg) => {
              // 👇 SAFE CHECK: Extracts string ID regardless of whether the backend populated the sender object or used a different key
              const msgSenderId = msg.senderId?._id || msg.senderId || msg.sender?._id || msg.sender;
              const isMine = String(msgSenderId) === String(myUserId);
              
              return (
                <div 
                  key={msg._id} 
                  className={`civic-chatwin-bubble-wrapper ${isMine ? 'civic-chatwin-mine' : 'civic-chatwin-theirs'}`}
                >
                  <div className={`civic-chatwin-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {msg.content || msg.text /* Ensuring backwards compatibility if DB uses content instead of text */}
                  </div>
                  <div className="civic-chatwin-time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
            
            {/* Invisible div to scroll down to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="civic-chatwin-input-area">
            {token && myUserId ? (
              <form onSubmit={handleSendMessage} className="civic-chatwin-form">
                <input 
                  type="text" 
                  className="civic-chatwin-input" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="civic-chatwin-send-btn"
                  disabled={!newMessage.trim() || loading}
                >
                  Send
                </button>
              </form>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#A0AEC0',
                backgroundColor: '#F7FAFC',
                borderRadius: '8px',
                margin: '10px 20px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  🔒 Login Required to Send Messages
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  Please <Link to="/auth" style={{ color: '#2B6CB0', textDecoration: 'none', fontWeight: 'bold' }}>log in</Link> to participate in conversations.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ChatWindow;