import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../navbar/navbar';
import './problemupload.css'; 

const AddProblem = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [importance, setImportance] = useState('Medium'); 
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Loading & UI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiInsights, setAiInsights] = useState(null);

  // Location Search State
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);

  // Handle Location Search via OpenStreetMap API
  useEffect(() => {
    const fetchLocations = async () => {
      // Only search if user typed at least 3 characters
      if (!location || location.length < 3) {
        setLocationSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }

      // Avoid searching if they just selected a long name from the dropdown
      if (locationSuggestions.some(loc => loc.display_name === location)) {
        return; 
      }

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${location}&countrycodes=in&format=json&limit=5`
        );
        setLocationSuggestions(res.data);
        setIsDropdownOpen(true);
      } catch (e) {
      }
    };

    // Debounce the API call
    const delayDebounceFn = setTimeout(() => fetchLocations(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [location, locationSuggestions]);

  const handleSelectLocation = (locationObj) => {
    setLocation(locationObj.display_name);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchWrapperRef]);

  // 1. Handle Image Selection & Trigger AI Analysis
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show Preview
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Start AI Analysis
    setIsAnalyzing(true);
    setError('');
    setAiInsights(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://civicconnect-ai-service.onrender.com/api/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiData = response.data;
      
      // Auto-fill the form fields based on Gemini's JSON response!
      if (aiData.description) setDescription(aiData.description);
      if (aiData.problem_type) setCategory(aiData.problem_type);
      
      // Save extra insights like suggested solution to show the user
      setAiInsights({
        confidence: aiData.confidence,
        suggestedSolution: aiData.suggested_solution
      });

    } catch (err) {
      // We don't block the user if AI fails; they can still type manually
      setError('AI auto-fill is currently unavailable. You can still fill out the form manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Handle Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !description || !imageFile) {
      setError('Please fill out all required fields and upload an image.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // STEP A: Send JSON to Node.js Backend to create the record (Matches MongoDB Schema)
      const problemData = {
        title,
        location,
        importance, // Added mapping for the importance field
        category: category || 'Other',
        description,
        suggestedSolution: aiInsights?.suggestedSolution || '' 
      };

      const nodeResponse = await axios.post('https://civicconnect-m1vy.onrender.com/api/problems', problemData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newProblemId = nodeResponse.data._id; // Retrieve the ID

      // STEP B: Send Image to FastAPI Microservice using the Problem ID
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      await axios.post(`https://civicconnect-ai-service.onrender.com/api/images/${newProblemId}`, imageFormData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` // Optional: if FastAPI requires auth
        }
      });

      // Success! Redirect back to the feed
      navigate('/problems');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit problem. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="civic-add-layout">
        <Navbar />

        <div className="civic-add-container">
          <div className="civic-add-header">
            <h1 className="civic-add-title">Report an Issue</h1>
            <p className="civic-add-subtitle">Upload a photo. Our AI will help describe the problem.</p>
          </div>

          {error && <div className="civic-error-msg">⚠️ {error}</div>}

          <form className="civic-add-form" onSubmit={handleSubmit}>
            
            {/* Step 1: Upload Image (Triggers AI) */}
            <div className="civic-form-group">
              <label className="civic-form-label">1. Upload Photo (Required)</label>
              <div className="civic-image-upload-area">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="civic-file-input" 
                  onChange={handleImageChange}
                />
                {!imagePreview ? (
                  <div style={{ color: '#718096', fontWeight: 'bold' }}>
                    📸 Click here or drag an image to upload
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#48BB78', fontWeight: 'bold', marginBottom: '10px' }}>✓ Image Selected (Click to change)</div>
                    <img src={imagePreview} alt="Preview" className="civic-preview-img" />
                  </div>
                )}
              </div>
            </div>

            {/* AI Loading State */}
            {isAnalyzing && (
              <div className="civic-ai-loading">
                <span>✨</span> 
                <div>
                  <strong>Gemini AI is analyzing your image...</strong>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Generating description and category automatically.</div>
                </div>
              </div>
            )}

            {/* Step 2: Form Details */}
            <div className="civic-form-group">
              <label className="civic-form-label">Title</label>
              <input 
                type="text" 
                className="civic-form-input" 
                placeholder="e.g., Deep Pothole on Main Street"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="civic-form-group" style={{ position: 'relative' }} ref={searchWrapperRef}>
              <label className="civic-form-label">Location</label>
              <input 
                type="text" 
                className="civic-form-input" 
                placeholder="e.g., Search area or street name..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="off"
              />
              
              {/* Location Autocomplete Dropdown */}
              {isDropdownOpen && locationSuggestions.length > 0 && (
                <div className="civic-location-dropdown">
                  {locationSuggestions.map((loc) => (
                    <div 
                      key={loc.place_id} 
                      className="civic-dropdown-item"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc.display_name} 
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="civic-form-row">
              <div className="civic-form-group">
                <label className="civic-form-label">Category (AI Auto-filled)</label>
                <select 
                  className="civic-form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select a Category...</option>
                  <option value="Garbage or litter">Garbage or litter</option>
                  <option value="Potholes / road damage">Potholes / road damage</option>
                  <option value="Drainage / water logging issues">Drainage / water logging issues</option>
                  <option value="Public facility damage">Public facility damage</option>
                  <option value="Personal help / emergency">Personal help / emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="civic-form-group">
                <label className="civic-form-label">Importance</label>
                <select 
                  className="civic-form-select"
                  value={importance}
                  onChange={(e) => setImportance(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="civic-form-group">
              <label className="civic-form-label">Description (AI Auto-filled)</label>
              <textarea 
                className="civic-form-textarea" 
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                required
              />
              
              {aiInsights?.suggestedSolution && (
                <div className="civic-ai-insights">
                  <h4>✨ AI Suggested Solution (Confidence: {aiInsights.confidence}%)</h4>
                  <p>{aiInsights.suggestedSolution}</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="civic-submit-btn"
              disabled={isSubmitting || isAnalyzing || !imageFile}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Problem'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProblem;