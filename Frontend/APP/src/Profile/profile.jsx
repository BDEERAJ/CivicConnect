import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css'; // Assuming you have a CSS file for styling
// Uncomment the import below in your local code:
import Navbar from '../navbar/navbar';

// Fallback Navbar to prevent compilation errors in this preview environment


const  ProfileContent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Citizen';

  const [userProfile, setUserProfile] = useState(null);
  const [myProblems, setMyProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('You must be logged in to view your profile.');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const profileRes = await axios.get('https://civicconnect-m1vy.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserProfile(profileRes.data);

        const problemsRes = await axios.get('https://civicconnect-m1vy.onrender.com/api/problems/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMyProblems(problemsRes.data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data. The server might be offline or your session may have expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token, username, userId]);

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7FAFC', fontFamily: 'Inter, sans-serif' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#2D3748', marginBottom: '15px' }}>Authentication Required</h2>
          <p style={{ color: '#718096', marginBottom: '25px' }}>Please log in to view your profile and reported issues.</p>
          <Link to="/auth" style={{ backgroundColor: '#2B6CB0', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
   <>

      <div className="civic-profile-layout">
        <Navbar />

        <div className="civic-profile-container">
          
          {loading && <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>Loading profile...</div>}
          {error && <div style={{ textAlign: 'center', padding: '50px', color: '#E53E3E', fontWeight: 'bold' }}>{error}</div>}

          {!loading && !error && (
            <>
              {/* Profile Header */}
              <div className="civic-profile-header-card">
                <div className="civic-profile-avatar">
                  {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="civic-profile-info">
                  <h1>{userProfile?.username || username}</h1>
                  <p>{userProfile?.email || 'Citizen Account'}</p>
                </div>
                
                <div className="civic-profile-stats">
                  <div className="civic-stat-box">
                    <span className="civic-stat-num">{myProblems.length}</span>
                    <span className="civic-stat-label">Reported</span>
                  </div>
                  <div className="civic-stat-box">
                    <span className="civic-stat-num">
                      {myProblems.filter(p => p.status === 'Resolved').length}
                    </span>
                    <span className="civic-stat-label">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <h2 className="civic-section-title">My Reported Issues</h2>
              
              {myProblems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #CBD5E0' }}>
                  <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '20px' }}>You haven't reported any issues yet.</p>
                  <Link to="/add-problem" style={{ backgroundColor: '#2B6CB0', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    Report an Issue Now
                  </Link>
                </div>
              ) : (
                <div className="civic-problems-grid">
                  {myProblems.map((problem) => (
                    <div key={problem._id || Math.random()} className="civic-problem-card">
                      
                      <div className="civic-card-header">
                        <div>
                          <Link to={`/problems/${problem._id}`} className="civic-card-title">
                            {problem.title}
                          </Link>
                          <div className="civic-card-meta">
                            <span>📍 {problem.location}</span>
                            <span>📅 {new Date(problem.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`civic-badge ${
                          problem.status === 'Resolved' ? 'civic-badge-resolved' : 
                          problem.status === 'In Progress' ? 'civic-badge-inprogress' : 
                          'civic-badge-pending'
                        }`}>
                          {problem.status}
                        </span>
                      </div>

                      <p className="civic-card-desc">
                        {problem.description?.length > 180 
                          ? problem.description.substring(0, 180) + '...' 
                          : problem.description}
                      </p>

                      <div className="civic-card-actions">
                        <Link to={`/problems/${problem._id}`} className="civic-view-btn">
                          View Details
                        </Link>
                        
                        {/* 👇 The Solve Button - only shows if the problem is not yet resolved */}
                        {problem.status !== 'Resolved' && (
                          <Link to={`/resolve/${problem._id}`} className="civic-solve-btn">
                            ✅ Solve / Update Status
                          </Link>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default ProfileContent;