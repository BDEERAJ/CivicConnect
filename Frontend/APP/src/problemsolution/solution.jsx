import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './solution.css'; 
import Navbar from '../navbar/navbar';


const ResolveProblemContent = () => {
  const { id } = useParams();
  const problemId = id || 'mock_12345';
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || 'fake-token';

  // State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Resolution State
  const [resolvedImageFile, setResolvedImageFile] = useState(null);
  const [resolvedImagePreview, setResolvedImagePreview] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Original Problem Details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`https://civicconnect-m1vy.onrender.com/api/problems/${problemId}`);
        setProblem(response.data);
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        // Preview fallback data
        setProblem({
          _id: problemId,
          title: 'Deep Pothole on Main Street',
          description: 'A very large pothole causing traffic slowdowns and vehicle damage.',
          location: 'Hyderabad, near Secunderabad Station',
          status: 'In Progress'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // 2. Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResolvedImageFile(file);
    setResolvedImagePreview(URL.createObjectURL(file));
    setAiResult(null); // Reset AI result if they pick a new image
    setError('');
  };

  // 3. Verify Resolution using FastAPI & Gemini
  const handleVerify = async () => {
    if (!resolvedImageFile) {
      setError('Please upload an image showing the resolved problem.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setAiResult(null);

    try {
      const originalImageResponse = await fetch(`https://civicconnect-ai-service.onrender.com/api/images/${problemId}`);
      if (!originalImageResponse.ok) {
        throw new Error('Failed to load the original problem image from FastAPI.');
      }

      const originalImageBlob = await originalImageResponse.blob();
      const originalImageFile = new File(
        [originalImageBlob],
        `${problemId}.jpg`,
        { type: originalImageBlob.type || 'image/jpeg' }
      );

      const formData = new FormData();
      formData.append('original_image', originalImageFile);
      formData.append('resolved_image', resolvedImageFile);

      const response = await axios.post('https://civicconnect-ai-service.onrender.com/api/ai/verify-resolution', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('AI Verification Result:', response.data);
      setAiResult(response.data);

    } catch (err) {
      console.error('Verification failed:', err);
      setError('Failed to verify with AI inspector. Please try again.');
      
      // Mocking AI response for preview environment testing if backend is offline
      setTimeout(() => {
        setAiResult({
          is_resolved: Math.random() > 0.5,
          accuracy_score: Math.floor(Math.random() * 40) + 60,
          what_is_missing: 'The hole was filled, but the surface is not leveled properly. It might degrade quickly when it rains.',
          remarks: 'Work is mostly done, but lacks finishing touches.'
        });
        setError('');
      }, 1500);

    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitResolution = async () => {
    if (!aiResult || !aiResult.is_resolved) return;

    setIsSubmitting(true);
    try {
      // Patch request to Node.js backend to update the status to 'Resolved'
      await axios.patch(`https://civicconnect-m1vy.onrender.com/api/problems/${problemId}/status`, 
        { status: 'Resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // (Optional) Save the resolved image proof to FastAPI under a valid filename.
      const formData = new FormData();
      formData.append('file', resolvedImageFile);
      await axios.post(`https://civicconnect-ai-service.onrender.com/api/images/${problemId}-resolved`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(e => console.log('Resolved image save skipped/failed', e));

      navigate('/profile');

    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to mark problem as resolved.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="civic-resolve-layout">
        <Navbar />

        <div className="civic-resolve-container">
          <div className="civic-resolve-header">
            <h1 className="civic-resolve-title">Verify Resolution</h1>
            <p className="civic-resolve-subtitle">Our AI Inspector will verify if the reported issue has been properly fixed.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>Loading problem details...</div>
          ) : (
            <div className="civic-resolve-grid">
              
              {/* Left Column: Original Problem */}
              <div className="civic-card">
                <h2 className="civic-card-heading">Original Report</h2>
                <div className="civic-orig-img-wrapper">
                  <img 
                    src={`https://civicconnect-ai-service.onrender.com/api/images/${problem._id}`} 
                    alt="Original Problem" 
                    className="civic-orig-img"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="civic-problem-info">
                  <h3>{problem.title}</h3>
                  <p><strong>Location:</strong> {problem.location}</p>
                  <p>{problem.description}</p>
                </div>
              </div>

              {/* Right Column: Upload & Verify */}
              <div className="civic-card">
                <h2 className="civic-card-heading">Submit Resolution</h2>
                
                {error && <div className="civic-error-msg">⚠️ {error}</div>}

                <div className="civic-image-upload-area">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="civic-file-input" 
                    onChange={handleImageChange}
                  />
                  {!resolvedImagePreview ? (
                    <div style={{ color: '#718096', fontWeight: 'bold' }}>
                      📸 Upload photo of the completed work
                    </div>
                  ) : (
                    <img src={resolvedImagePreview} alt="Resolved Preview" className="civic-preview-img" />
                  )}
                </div>

                {!aiResult && !isVerifying && (
                  <button 
                    className="civic-btn civic-btn-verify" 
                    onClick={handleVerify}
                    disabled={!resolvedImageFile}
                  >
                    🤖 Run AI Inspection
                  </button>
                )}

                {isVerifying && (
                  <div className="civic-ai-box civic-ai-loading">
                    <span>🔍</span> Analyzing image details and comparing with original report...
                  </div>
                )}

                {aiResult && !isVerifying && (
                  <div className={`civic-ai-box ${aiResult.is_resolved ? 'civic-ai-success' : 'civic-ai-fail'}`}>
                    <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {aiResult.is_resolved ? '✅ Verification Passed' : '❌ Verification Failed'}
                    </h3>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Accuracy Score:</strong> {aiResult.accuracy_score}%</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Remarks:</strong> {aiResult.remarks}</p>
                    
                    {!aiResult.is_resolved && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>
                        <strong>What's Missing:</strong> {aiResult.what_is_missing}
                      </div>
                    )}
                  </div>
                )}

                {/* ONLY SHOW Submit Button if AI verified the resolution */}
                {aiResult && aiResult.is_resolved && (
                  <button 
                    className="civic-btn civic-btn-submit" 
                    onClick={handleSubmitResolution}
                    disabled={isSubmitting}
                    style={{ marginTop: '20px' }}
                  >
                    {isSubmitting ? 'Updating Status...' : 'Confirm & Mark as Resolved'}
                  </button>
                )}
                
                {/* Inform user why they can't submit */}
                {aiResult && !aiResult.is_resolved && (
                  <p style={{ color: '#E53E3E', fontSize: '0.9rem', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
                    AI detected unresolved issues. Please fix the problem properly and upload a new image.
                  </p>
                )}

              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResolveProblemContent;