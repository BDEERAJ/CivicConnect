import React, { useState, useEffect, useRef } from 'react';
import { Link, BrowserRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar';
import './problem.css'; 
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