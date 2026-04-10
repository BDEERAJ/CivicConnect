import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar'; // Adjust path if needed
import './singleproblem.css'; // Assuming you have a CSS file for styling
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
        const response = await axios.get(`https://civicconnect-m1vy.onrender.com/api/problems/${problemId}`);
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
      await axios.post(`https://civicconnect-m1vy.onrender.com/api/problems/${problemId}/${type}`, {}, {
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
      await axios.post(`https://civicconnect-m1vy.onrender.com/api/problems/${problemId}/comments`, 
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
                  src={`https://civicconnect-ai-service.onrender.com/api/images/${problem._id}`} 
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