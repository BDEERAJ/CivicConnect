import React, { useState, useEffect, useRef } from 'react';
import { Link, BrowserRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar';
import './problem.css'; // Assuming you have a CSS file for styling

const ProblemsContent = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [locationSearch, setLocationSearch] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);

  const fetchProblems = async (city) => {
    setLoading(true);
    setError('');
    try {
      const url = city 
        ? `https://civicconnect-m1vy.onrender.com/api/problems?location=${city}`
        : `https://civicconnect-m1vy.onrender.com/api/problems`;

      const response = await axios.get(url);
      console.log("Fetched problems:", response.data);
      setProblems(response.data);
    } catch (err) {
      setError('Failed to load problems. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems('');
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!locationSearch || locationSearch.length < 3) {
        setLocationSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${locationSearch}&countrycodes=in&format=json&limit=5`
        );        
        setLocationSuggestions(res.data);
        setIsDropdownOpen(true);
      } catch (e) {
        console.error("OpenStreetMap fetch failed", e);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchLocations(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [locationSearch]);

  const handleSelectLocation = (locationObj) => {
    // FIX: OpenStreetMap frequently lacks 'name'. Fallback to the first part of 'display_name'
    const shortCityName = locationObj.display_name || '';
    setLocationSearch(shortCityName);
    setIsDropdownOpen(false);
    fetchProblems(shortCityName);
  };

  const handleClearSearch = () => {
    setLocationSearch('');
    setIsDropdownOpen(false);
    fetchProblems(''); 
  };

  // FIX: Apply BOTH status and location filters properly
  const displayedProblems = problems.filter(problem => {
    // 1. Status Filter
    const matchesStatus = showResolved ? problem.status === 'Resolved' : problem.status !== 'Resolved';
    
    // 2. Location Filter (Frontend check guarantees it works even if backend matching is loose)
    const matchesLocation = locationSearch 
      ? problem.location?.toLowerCase().includes(locationSearch.toLowerCase().trim())
      : true;

    return matchesStatus && matchesLocation;
  });

  return (
    <>
      <style>{`
        .civic-problems-layout {
          min-height: 100vh;
          background-color: #F7FAFC; 
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 50px;
        }
        
        .civic-problems-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .civic-problems-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .civic-problems-title {
          color: #2B6CB0; 
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 10px 0;
        }
        
        .civic-problems-controls {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .civic-problems-search-wrapper {
          position: relative;
          width: 300px;
        }
        .civic-problems-search-input {
          width: 100%;
          padding: 10px 35px 10px 15px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .civic-problems-search-input:focus { border-color: #2B6CB0; }
        
        .civic-problems-clear-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #A0AEC0;
          font-weight: bold;
        }
        
        .civic-problems-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          margin-top: 5px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
        }
        .civic-problems-dropdown-item {
          padding: 12px 15px;
          cursor: pointer;
          border-bottom: 1px solid #F7FAFC;
          font-size: 0.9rem;
          color: #4A5568;
        }
        .civic-problems-dropdown-item:hover {
          background-color: #F7FAFC; 
          color: #2B6CB0;
        }

        .civic-problems-toggle-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .civic-problems-toggle-active { background-color: #2B6CB0; color: white; }
        .civic-problems-toggle-resolved { background-color: #48BB78; color: white; }
        .civic-problems-toggle-inactive { background-color: #E2E8F0; color: #718096; }

        .civic-problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }
        
        .civic-problems-card {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s;
          border-top: 5px solid #2B6CB0;
        }
        .civic-problems-card-resolved { border-top-color: #48BB78; }
        .civic-problems-card-pending { border-top-color: #ED8936; }
        
        .civic-problems-card:hover { transform: translateY(-4px); }
        
        .civic-problems-card-body {
          padding: 25px 30px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .civic-problems-badges {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .civic-problems-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          color: white;
        }
        .civic-problems-badge-pending { background-color: #ED8936; } 
        .civic-problems-badge-resolved { background-color: #48BB78; } 
        .civic-problems-badge-location { background-color: #718096; }
        
        .civic-problems-card-title {
          margin: 0 0 10px 0;
          color: #2D3748;
          font-size: 1.4rem;
          font-weight: bold;
        }
        .civic-problems-card-desc {
          color: #4A5568;
          font-size: 1rem;
          margin: 0 0 20px 0;
          line-height: 1.6;
          flex-grow: 1;
        }
        
        .civic-problems-btn-details {
          display: block;
          text-align: center;
          background-color: #F7FAFC;
          color: #2B6CB0;
          text-decoration: none;
          padding: 12px;
          border-radius: 6px;
          font-weight: bold;
          transition: background-color 0.2s;
          border: 1px solid #E2E8F0;
          margin-bottom: 20px;
        }
        .civic-problems-btn-details:hover {
          background-color: #E2E8F0;
        }

        .civic-problems-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #EDF2F7;
          padding-top: 15px;
          font-size: 0.9rem;
          color: #718096;
        }
        
        .civic-problems-votes-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .civic-problems-upvotes {
          color: #48BB78;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .civic-problems-downvotes {
          color: #E53E3E;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>

      <div className="civic-problems-layout">
        <Navbar />

        <div className="civic-problems-container">
          
          <div className="civic-problems-header">
            <div>
              <h1 className="civic-problems-title">Community Issues</h1>
              <p style={{ color: '#718096', margin: 0 }}>Browse, upvote, and track local problems.</p>
            </div>

            <div className="civic-problems-controls">
              <div className="civic-problems-search-wrapper" ref={searchWrapperRef}>
                <input 
                  type="text" 
                  placeholder="📍 Search city (e.g. Hyderabad...)" 
                  className="civic-problems-search-input"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                
                {locationSearch && (
                  <button className="civic-problems-clear-btn" onClick={handleClearSearch}>✕</button>
                )}

                {isDropdownOpen && locationSuggestions.length > 0 && (
                  <div className="civic-problems-dropdown">
                    {locationSuggestions.map((loc) => (
                      <div 
                        key={loc.place_id} 
                        className="civic-problems-dropdown-item"
                        onClick={() => handleSelectLocation(loc)}
                      >
                        {loc.display_name} 
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className={`civic-problems-toggle-btn ${!showResolved ? 'civic-problems-toggle-active' : 'civic-problems-toggle-inactive'}`}
                onClick={() => setShowResolved(false)}
              >
                Active Issues
              </button>
              
              <button 
                className={`civic-problems-toggle-btn ${showResolved ? 'civic-problems-toggle-resolved' : 'civic-problems-toggle-inactive'}`}
                onClick={() => setShowResolved(true)}
              >
                Resolved ✅
              </button>
            </div>
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#718096' }}>Loading problems...</p>}
          {error && <p style={{ textAlign: 'center', color: '#ED8936' }}>{error}</p>}
          
          {!loading && displayedProblems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px' }}>
              <h3 style={{ color: '#2B6CB0' }}>No problems found!</h3>
              <p style={{ color: '#718096' }}>No matching issues found for this location.</p>
            </div>
          )}

          <div className="civic-problems-grid">
            {displayedProblems.map((problem) => (
              <div 
                key={problem._id} 
                className={`civic-problems-card ${problem.status === 'Resolved' ? 'civic-problems-card-resolved' : 'civic-problems-card-pending'}`}
              >
                
                <div className="civic-problems-card-body">
                  <div className="civic-problems-badges">
                    <span className={`civic-problems-badge ${problem.status === 'Resolved' ? 'civic-problems-badge-resolved' : 'civic-problems-badge-pending'}`}>
                      {problem.status}
                    </span>
                    <span className="civic-problems-badge civic-problems-badge-location">
                      📍 {problem.location}
                    </span>
                  </div>

                  <h3 className="civic-problems-card-title">{problem.title}</h3>
                  <p className="civic-problems-card-desc">
                    {problem.description?.length > 150 
                      ? problem.description.substring(0, 150) + '...' 
                      : problem.description}
                  </p>

                  <Link to={`/problems/${problem._id}`} className="civic-problems-btn-details">
                    View Full Details
                  </Link>

                  <div className="civic-problems-card-footer">
                    <span>By {problem.authorId?.username || 'Unknown'}</span>
                    
                    <div className="civic-problems-votes-container">
                      <div className="civic-problems-upvotes">
                        <span>⬆️</span> {problem.upvotes?.length || 0}
                      </div>
                      <div className="civic-problems-downvotes">
                        <span>⬇️</span> {problem.downvotes?.length || 0}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default ProblemsContent