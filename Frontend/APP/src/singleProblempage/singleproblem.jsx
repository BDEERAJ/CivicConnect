import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; // Adjust path if needed

// Uncomment the import below in your local code:
// import Navbar from '../navbar/navbar';

// Fallback Navbar to prevent compilation errors in this preview environment


const ProblemDetails = () => {
  const { id } = useParams();
  const problemId = id; 
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Comment State
  const [commentText, setCommentText] = useState('');

  const token = localStorage.getItem('token');
  const myUserId = localStorage.getItem('userId');

  // 1. Fetch Full Details from Node.js
  useEffect(() => {
    if (!problemId) {
        setError('No problem ID provided.');
        setLoading(false);
        return;
    }

    const fetchSingleProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/problems/${problemId}`);
        setProblem(response.data);
      } catch (err) {
        console.error('Backend unavailable:', err);
        setError('Failed to load problem details. The server might be offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchSingleProblem();
  }, [problemId]);

  // 2. Handle Upvote / Downvote
  const handleVote = async (type) => {
    if (!token) return alert('Please log in to vote.');
    
    // Optimistic UI update
    setProblem((prev) => {
      const updated = { ...prev };
      
      // Initialize arrays if they don't exist
      if (!updated.upvotes) updated.upvotes = [];
      if (!updated.downvotes) updated.downvotes = [];

      if (type === 'upvote') {
        if (!updated.upvotes.includes(myUserId)) updated.upvotes.push(myUserId);
        updated.downvotes = updated.downvotes.filter(id => id !== myUserId);
      } else {
        if (!updated.downvotes.includes(myUserId)) updated.downvotes.push(myUserId);
        updated.upvotes = updated.upvotes.filter(id => id !== myUserId);
      }
      return updated;
    });

    try {
      await axios.post(`http://localhost:5000/api/problems/${problemId}/${type}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  // 3. Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!token) return alert('Please log in to comment.');

    // Optimistic UI update
    const newComment = {
      _id: Date.now().toString(),
      user: { username: localStorage.getItem('username') || 'You' },
      text: commentText,
      createdAt: new Date().toISOString()
    };
    
    setProblem(prev => ({ 
      ...prev, 
      comments: prev.comments ? [...prev.comments, newComment] : [newComment] 
    }));
    setCommentText('');

    try {
      await axios.post(`http://localhost:5000/api/problems/${problemId}/comments`, 
        { text: newComment.text }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Comment failed', err);
      // Optional: Handle reverting optimistic update here
    }
  };

  return (
    <>
      <style>{`
        .civic-details-layout {
          min-height: 100vh;
          background-color: #F7FAFC; /* Soft Oatmeal */
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 50px;
        }
        
        .civic-details-container {
          width: 75vw; 
          min-width: 320px;
          max-width: 1000px; 
          margin: 40px auto;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .civic-details-header {
          padding: 30px 40px;
          border-bottom: 1px solid #E2E8F0;
        }
        .civic-details-back-link {
          display: inline-block;
          color: #718096;
          text-decoration: none;
          font-weight: bold;
          margin-bottom: 20px;
          transition: color 0.2s;
        }
        .civic-details-back-link:hover { color: #2B6CB0; }

        .civic-details-title {
          color: #2B6CB0;
          font-size: 2.5rem;
          font-weight: 900;
          margin: 0 0 15px 0;
          line-height: 1.2;
        }

        .civic-details-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .civic-details-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: bold;
          color: white;
        }
        .civic-details-badge-pending { background-color: #ED8936; } 
        .civic-details-badge-resolved { background-color: #48BB78; } 
        .civic-details-badge-inprogress { background-color: #D69E2E; } 
        .civic-details-badge-location { background-color: #718096; }

        /* 📸 Image fetched from FastAPI */
        .civic-details-image-wrapper {
          width: 100%;
          background-color: #EDF2F7;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #E2E8F0;
        }
        .civic-details-image {
          width: 100%;
          max-height: 500px;
          object-fit: contain; 
        }

        .civic-details-body {
          padding: 30px 40px;
        }

        .civic-details-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #A0AEC0;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .civic-details-desc {
          color: #4A5568;
          font-size: 1.15rem;
          line-height: 1.7;
          margin: 0 0 30px 0;
          white-space: pre-wrap; 
        }

        /* --- Actions Row (Votes & Chat) --- */
        .civic-details-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid #E2E8F0;
          flex-wrap: wrap;
          gap: 20px;
        }

        .civic-details-votes {
          display: flex;
          gap: 10px;
        }
        .civic-vote-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        .civic-btn-up {
          background-color: #F0FFF4;
          color: #48BB78;
          border-color: #48BB78;
        }
        .civic-btn-up:hover { background-color: #48BB78; color: white; }
        
        .civic-btn-down {
          background-color: #FFF5F5;
          color: #E53E3E;
          border-color: #E53E3E;
        }
        .civic-btn-down:hover { background-color: #E53E3E; color: white; }

        .civic-details-author-box {
          display: flex;
          align-items: center;
          gap: 15px;
          background-color: #F7FAFC;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
        }
        .civic-author-icon {
          background-color: #2B6CB0;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .civic-chat-btn {
          background-color: #2B6CB0;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        .civic-chat-btn:hover { background-color: #22548A; }

        /* --- Comments Section --- */
        .civic-comments-section {
          background-color: #F7FAFC;
          padding: 30px 40px;
          border-top: 1px solid #E2E8F0;
        }
        .civic-comments-header {
          font-size: 1.4rem;
          font-weight: bold;
          color: #2D3748;
          margin: 0 0 20px 0;
        }
        
        .civic-comment-form {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        .civic-comment-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
        }
        .civic-comment-input:focus { border-color: #2B6CB0; }
        .civic-comment-submit {
          background-color: #48BB78;
          color: white;
          border: none;
          padding: 0 25px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .civic-comment-submit:disabled { background-color: #CBD5E0; cursor: not-allowed; }

        .civic-comment-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .civic-comment-card {
          background-color: white;
          padding: 15px 20px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .civic-comment-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        .civic-comment-user { font-weight: bold; color: #2B6CB0; }
        .civic-comment-date { color: #A0AEC0; }
        .civic-comment-text { margin: 0; color: #4A5568; line-height: 1.5; }

      `}</style>

      <div className="civic-details-layout">
        <Navbar />

        <div className="civic-details-container">
          
          {loading && <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: '#718096' }}>Loading full details...</div>}
          {error && <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: '#E53E3E', fontWeight: 'bold' }}>{error}</div>}
          
          {!loading && !error && problem && (
            <>
              {/* Header Section */}
              <div className="civic-details-header">
                <Link to="/problems" className="civic-details-back-link">
                  ← Back to Feed
                </Link>
                
                <h1 className="civic-details-title">{problem.title}</h1>
                
                <div className="civic-details-meta-row">
                  <span className={`civic-details-badge ${
                    problem.status === 'Resolved' ? 'civic-details-badge-resolved' : 
                    problem.status === 'In Progress' ? 'civic-details-badge-inprogress' : 
                    'civic-details-badge-pending'
                  }`}>
                    Status: {problem.status}
                  </span>
                  <span className="civic-details-badge civic-details-badge-location">
                    📍 {problem.location}
                  </span>
                  <span style={{ color: '#A0AEC0', fontWeight: '500' }}>
                    Reported: {new Date(problem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* 📸 The Heavy FastAPI Image Section */}
              <div className="civic-details-image-wrapper">
                <img 
                  src={`http://localhost:8000/api/images/${problem._id}`} 
                  alt={problem.title} 
                  className="civic-details-image"
                  onError={(e) => {
                    e.target.onerror = null; 
                    // Fallback to a placeholder if the Python image server is unreachable
                    e.target.src = 'https://via.placeholder.com/1200x500?text=Image+Unavailable';
                  }}
                />
              </div>

              {/* Body Section */}
              <div className="civic-details-body">
                <div className="civic-details-label">Problem Description</div>
                <p className="civic-details-desc">{problem.description}</p>

                {/* 💬 Actions & Author Block */}
                <div className="civic-details-actions-row">
                  
                  <div className="civic-details-votes">
                    <button className="civic-vote-btn civic-btn-up" onClick={() => handleVote('upvote')}>
                      ⬆️ {problem.upvotes?.length || 0}
                    </button>
                    <button className="civic-vote-btn civic-btn-down" onClick={() => handleVote('downvote')}>
                      ⬇️ {problem.downvotes?.length || 0}
                    </button>
                  </div>

                  <div className="civic-details-author-box">
                    <div className="civic-author-icon">
                      {problem.authorId?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>Reported by</div>
                      <div style={{ fontWeight: 'bold', color: '#2D3748', marginBottom: '5px' }}>
                        {problem.authorId?.username || 'Unknown Citizen'}
                      </div>
                      {/* 👇 Links directly to the 1-on-1 Chat Window! */}
                      {problem.authorId?._id && problem.authorId?._id !== myUserId && (
                        <Link to={`/chat/${problem.authorId._id}`} className="civic-chat-btn">
                          💬 Chat with Author
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* 📝 Comments Section */}
              <div className="civic-comments-section">
                <h3 className="civic-comments-header">Community Discussion ({problem.comments?.length || 0})</h3>
                
                <form onSubmit={handleAddComment} className="civic-comment-form">
                  <input 
                    type="text" 
                    placeholder="Add a public comment or update..." 
                    className="civic-comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="civic-comment-submit" disabled={!commentText.trim()}>
                    Post
                  </button>
                </form>

                <div className="civic-comment-list">
                  {problem.comments && problem.comments.length > 0 ? (
                    problem.comments.map(comment => (
                      <div key={comment._id} className="civic-comment-card">
                        <div className="civic-comment-top">
                          <span className="civic-comment-user">{comment.authorId?.username || 'User'}</span>
                          <span className="civic-comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="civic-comment-text">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#A0AEC0', textAlign: 'center', padding: '20px' }}>
                      No comments yet. Be the first to start the discussion!
                    </p>
                  )}
                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </>
  );
};

export default ProblemDetails;