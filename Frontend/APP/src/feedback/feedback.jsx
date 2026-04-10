import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar/navbar';
import './feedback.css'; 
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
      await axios.post(
        'https://civicconnect-m1vy.onrender.com/api/feedback',
        { category, message },
      );

      setStatus('success');
      setCategory('General');
      setMessage('');
      
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