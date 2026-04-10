import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; // Adjust path if needed
import './chatlog.css'; // Assuming you have a CSS file for styling
const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    // If there is no token, don't even try to fetch. Just stop loading.
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      try {
        const response = await axios.get('https://civicconnect-m1vy.onrender.com/api/users/chat/contacts', {
          headers: {
            Authorization: `Bearer ${token}` // 👈 Securely passing the token!
          }
        });
        setContacts(response.data);
      } catch (err) {
        setError('Failed to load your chat history.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [token]);

  return (
    <>
      
      <div className="civic-chat-layout">
        <Navbar />

        <div className="civic-chat-container">
          
          <div className="civic-chat-header">
            <h1 className="civic-chat-title">Your Messages</h1>
            <p className="civic-chat-subtitle">Connect with community members and NGOs.</p>
          </div>

          {/* SCENARIO 1: Not Logged In */}
          {!token && !loading && (
            <div className="civic-chat-auth-warning">
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</div>
              <div className="civic-chat-auth-title">Members Only</div>
              <p style={{ color: '#718096' }}>You must be logged in to view your messages and chat with the community.</p>
              <Link to="/auth" className="civic-chat-auth-btn">
                Log In to Chat
              </Link>
            </div>
          )}

          {/* SCENARIO 2: Loading Data */}
          {loading && token && (
            <div className="civic-chat-loader-wrapper">
              <div className="civic-chat-spinner"></div>
              <div style={{ color: '#718096', fontWeight: '500' }}>Loading your conversations...</div>
            </div>
          )}

          {/* SCENARIO 3: Error */}
          {error && <p style={{ textAlign: 'center', color: '#ED8936', padding: '20px' }}>{error}</p>}

          {/* SCENARIO 4: Logged in, but no chats yet */}
          {!loading && token && !error && contacts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px' }}>
              <h3 style={{ color: '#2B6CB0' }}>Your inbox is empty</h3>
              <p style={{ color: '#718096' }}>Start a conversation by viewing a problem and messaging the author.</p>
            </div>
          )}

          {/* SCENARIO 5: Display Contacts */}
          {!loading && token && !error && contacts.length > 0 && (
            <div className="civic-chat-list">
              {contacts.map((contact) => (
                <Link 
                  to={`/chat/${contact._id}`} 
                  key={contact._id} 
                  className="civic-chat-card"
                >
                  <div className="civic-chat-avatar">
                    {/* Display the first letter of their username */}
                    {contact.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="civic-chat-name">{contact.username}</h3>
                    <p className="civic-chat-status">Tap to open conversation</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Chat;