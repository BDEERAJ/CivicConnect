import React, { useState } from 'react';
import axios from 'axios';
// Uncomment the import below in your local code:
import Navbar from '../navbar/navbar';
const Feedback = () => {
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setErrorMessage('Please enter a message before submitting.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Post the feedback to your Node.js backend
      await axios.post(
        'http://localhost:5000/api/feedback',
        { category, message },
      );

      setStatus('success');
      setCategory('General');
      setMessage('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);

    } catch (error) {
      console.error('Feedback submission failed:', error);
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Failed to submit feedback. Our server might be down.'
      );
    }
  };

  return (
    <>
      <style>{`
        .civic-feedback-layout {
          min-height: 100vh;
          background-color: #F7FAFC; /* Soft Oatmeal */
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }
        
        .civic-feedback-container {
          width: 90%;
          max-width: 600px;
          margin: 60px auto;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          padding: 40px;
        }

        .civic-feedback-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .civic-feedback-title {
          color: #2B6CB0; /* Ocean Blue */
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0 0 10px 0;
        }

        .civic-feedback-subtitle {
          color: #718096;
          font-size: 1.1rem;
          margin: 0;
        }

        .civic-feedback-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .civic-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .civic-form-label {
          font-weight: bold;
          color: #2D3748;
          font-size: 0.95rem;
        }

        .civic-form-select,
        .civic-form-textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          background-color: #F7FAFC;
          font-family: inherit;
          box-sizing: border-box;
        }

        .civic-form-select:focus,
        .civic-form-textarea:focus {
          border-color: #2B6CB0;
          background-color: white;
        }

        .civic-form-textarea {
          min-height: 150px;
          resize: vertical;
          line-height: 1.5;
        }

        .civic-submit-btn {
          background-color: #48BB78; /* Sage Green */
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 10px;
        }

        .civic-submit-btn:hover:not(:disabled) {
          background-color: #38A169;
        }

        .civic-submit-btn:disabled {
          background-color: #CBD5E0;
          cursor: not-allowed;
        }

        /* Status Messages */
        .civic-status-message {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: bold;
          text-align: center;
        }
        
        .civic-status-success {
          background-color: #F0FFF4;
          color: #2F855A;
          border: 1px solid #9AE6B4;
        }

        .civic-status-error {
          background-color: #FFF5F5;
          color: #C53030;
          border: 1px solid #FEB2B2;
        }

        .civic-not-logged-in {
          background-color: #EBF8FF;
          color: #2B6CB0;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #BEE3F8;
        }
      `}</style>

      <div className="civic-feedback-layout">
        <Navbar />

        <div className="civic-feedback-container">
          <div className="civic-feedback-header">
            <h1 className="civic-feedback-title">Share Your Feedback</h1>
            <p className="civic-feedback-subtitle">Help us improve CivicConnect for your community.</p>
          </div>

          {!token && (
            <div className="civic-not-logged-in">
              <strong>Note:</strong> You are not logged in. Your feedback will be submitted anonymously.
            </div>
          )}

          {status === 'success' && (
            <div className="civic-status-message civic-status-success">
              🎉 Thank you! Your feedback has been successfully submitted.
            </div>
          )}

          {status === 'error' && (
            <div className="civic-status-message civic-status-error">
              ⚠️ {errorMessage}
            </div>
          )}

          <form className="civic-feedback-form" onSubmit={handleSubmit}>
            <div className="civic-form-group">
              <label htmlFor="category" className="civic-form-label">Category</label>
              <select 
                id="category" 
                className="civic-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={status === 'loading'}
              >
                <option value="General">General Feedback</option>
                <option value="Bug Report">Report a Bug / Issue</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Community Suggestion">Community Suggestion</option>
              </select>
            </div>

            <div className="civic-form-group">
              <label htmlFor="message" className="civic-form-label">Your Message</label>
              <textarea 
                id="message" 
                className="civic-form-textarea" 
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'loading'}
                required
              />
            </div>

            <button 
              type="submit" 
              className="civic-submit-btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Feedback;