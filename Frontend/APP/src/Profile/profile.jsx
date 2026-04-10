import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        const profileRes = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserProfile(profileRes.data);

        const problemsRes = await axios.get('http://localhost:5000/api/problems/me', {
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
      <style>{`
        .civic-profile-layout {
          min-height: 100vh;
          background-color: #F7FAFC;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 60px;
        }

        .civic-profile-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 20px;
        }

        /* --- Profile Header Card --- */
        .civic-profile-header-card {
          background-color: white;
          border-radius: 16px;
          padding: 40px;
          display: flex;
          align-items: center;
          gap: 30px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .civic-profile-avatar {
          width: 100px;
          height: 100px;
          background-color: #2B6CB0;
          color: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 3rem;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(43, 108, 176, 0.3);
        }

        .civic-profile-info h1 {
          margin: 0 0 5px 0;
          color: #2D3748;
          font-size: 2.2rem;
          font-weight: 900;
        }

        .civic-profile-info p {
          margin: 0;
          color: #718096;
          font-size: 1.1rem;
        }

        .civic-profile-stats {
          margin-left: auto;
          display: flex;
          gap: 20px;
          background-color: #F7FAFC;
          padding: 15px 25px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .civic-stat-box {
          text-align: center;
        }
        .civic-stat-num {
          display: block;
          font-size: 1.8rem;
          font-weight: 900;
          color: #2B6CB0;
        }
        .civic-stat-label {
          font-size: 0.85rem;
          color: #718096;
          font-weight: bold;
          text-transform: uppercase;
        }

        /* --- Submissions Section --- */
        .civic-section-title {
          font-size: 1.8rem;
          color: #2D3748;
          font-weight: 800;
          margin-bottom: 20px;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 10px;
        }

        .civic-problems-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .civic-problem-card {
          background-color: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          border-left: 5px solid #2B6CB0;
          transition: transform 0.2s;
        }
        
        .civic-problem-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .civic-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .civic-card-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #2D3748;
          margin: 0 0 5px 0;
          text-decoration: none;
        }
        .civic-card-title:hover {
          color: #2B6CB0;
        }

        .civic-card-meta {
          color: #A0AEC0;
          font-size: 0.9rem;
          display: flex;
          gap: 15px;
        }

        .civic-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: bold;
          color: white;
        }
        .civic-badge-pending { background-color: #ED8936; }
        .civic-badge-inprogress { background-color: #D69E2E; }
        .civic-badge-resolved { background-color: #48BB78; }

        .civic-card-desc {
          color: #4A5568;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 1rem;
        }

        .civic-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid #EDF2F7;
          padding-top: 15px;
        }

        .civic-solve-btn {
          background-color: #48BB78;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .civic-solve-btn:hover {
          background-color: #38A169;
        }
        
        .civic-view-btn {
          color: #2B6CB0;
          font-weight: bold;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 8px;
          background-color: #EBF8FF;
          transition: background-color 0.2s;
        }
        .civic-view-btn:hover {
          background-color: #BEE3F8;
        }

        @media (max-width: 768px) {
          .civic-profile-header-card {
            flex-direction: column;
            text-align: center;
          }
          .civic-profile-stats {
            margin: 20px auto 0 auto;
            width: 100%;
            justify-content: center;
          }
          .civic-card-header {
            flex-direction: column;
          }
        }
      `}</style>

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