import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; // Adjust path if needed

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
        const response = await axios.get('http://localhost:5000/api/users/chat/contacts', {
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
      <style>{`
        .civic-chat-layout {
          min-height: 100vh;
          background-color: #F7FAFC; /* Soft Oatmeal */
          font-family: 'Inter', system-ui, sans-serif;
        }
        .civic-chat-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .civic-chat-header {
          margin-bottom: 30px;
        }
        .civic-chat-title {
          color: #2B6CB0; /* Ocean Blue */
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 5px 0;
        }
        .civic-chat-subtitle {
          color: #718096;
          margin: 0;
        }

        /* 🛑 Not Logged In State */
        .civic-chat-auth-warning {
          background-color: white;
          border-radius: 12px;
          padding: 50px 20px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border-top: 5px solid #ED8936; /* Sunset Orange */
        }
        .civic-chat-auth-title {
          color: #2D3748;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .civic-chat-auth-btn {
          display: inline-block;
          margin-top: 20px;
          background-color: #2B6CB0;
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .civic-chat-auth-btn:hover { background-color: #22548A; color: white; }

        /* ⏳ Loading Spinner */
        .civic-chat-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 50px 0;
        }
        .civic-chat-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E2E8F0;
          border-top: 4px solid #48BB78; /* Sage Green */
          border-radius: 50%;
          animation: civic-spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes civic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 📋 Contact List */
        .civic-chat-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .civic-chat-card {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid transparent;
        }
        .civic-chat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: #E2E8F0;
        }
        .civic-chat-avatar {
          width: 50px;
          height: 50px;
          background-color: #E2E8F0;
          color: #2B6CB0;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .civic-chat-name {
          color: #2D3748;
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0 0 3px 0;
        }
        .civic-chat-status {
          color: #48BB78; /* Sage Green */
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }
      `}</style>

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