import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; // Adjust path if needed
// Mock socket service for preview environment compilation
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
  // Grab contactId dynamically from the route (e.g., /chat/user_202)
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
        const contactResponse = await axios.get(`http://localhost:5000/api/users/${contactId}`);
        console.log('Contact response:', contactResponse.data);
        setContactName(contactResponse.data.username || 'Community Member');
        
        // Only fetch chat history if user is logged in
        if (token) {
          console.log('Fetching chat history with token');
          const response = await axios.get(`http://localhost:5000/api/users/${contactId}/chat`, {
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
      <style>{`
        .civic-chatwin-layout {
          min-height: 100vh;
          background-color: #F7FAFC; /* Soft Oatmeal */
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          height:fit-content;
          flex-direction: column;
        }
        .civic-chatwin-container {
          flex-grow: 1;
          max-width: 95vw;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background-color: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          height: calc(96vh - 70px); 
        }

        /* --- Header --- */
        .civic-chatwin-header {
          background-color: #2B6CB0; /* Ocean Blue */
          color: white;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 1px solid #1A365D;
        }
        .civic-chatwin-back-btn {
          color: white;
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        .civic-chatwin-back-btn:hover { opacity: 0.8; }
        
        .civic-chatwin-avatar {
          width: 40px;
          height: 40px;
          background-color: white;
          color: #2B6CB0;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .civic-chatwin-name {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
        }

        /* --- Message Area --- */
        .civic-chatwin-messages-area {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #F7FAFC;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .civic-chatwin-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 75%;
        }
        .civic-chatwin-mine { align-self: flex-end; align-items: flex-end; }
        .civic-chatwin-theirs { align-self: flex-start; align-items: flex-start; }

        .civic-chatwin-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          position: relative;
        }
        .civic-chatwin-bubble.mine {
          background-color: #2B6CB0; /* Ocean Blue */
          color: white;
          border-bottom-right-radius: 4px;
        }
        .civic-chatwin-bubble.theirs {
          background-color: white;
          color: #2D3748;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .civic-chatwin-time {
          font-size: 0.7rem;
          color: #A0AEC0;
          margin-top: 4px;
          margin-bottom: 0;
        }

        /* --- Input Area --- */
        .civic-chatwin-input-area {
          padding: 15px 20px;
          background-color: white;
          border-top: 1px solid #E2E8F0;
        }
        .civic-chatwin-form {
          display: flex;
          gap: 10px;
        }
        .civic-chatwin-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: 1px solid #E2E8F0;
          border-radius: 25px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          background-color: #F7FAFC;
        }
        .civic-chatwin-input:focus {
          border-color: #2B6CB0;
          background-color: white;
        }
        .civic-chatwin-send-btn {
          background-color: #48BB78; /* Sage Green */
          color: white;
          border: none;
          border-radius: 25px;
          padding: 0 25px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .civic-chatwin-send-btn:hover { background-color: #38A169; }
        .civic-chatwin-send-btn:disabled {
          background-color: #CBD5E0;
          cursor: not-allowed;
        }
      `}</style>

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