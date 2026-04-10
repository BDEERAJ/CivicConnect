import React, { useState } from 'react';
import { Link, BrowserRouter, useLocation } from 'react-router-dom';

// Uncomment the import below in your local code:
 import Navbar from '../navbar/navbar';

const HomeContent = () => {
  return (
    <>
      <style>{`
        .civic-home-layout {
          min-height: 100vh;
          background-color: #F7FAFC; /* Soft Oatmeal */
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* --- Hero Section --- */
        .civic-hero {
          background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }
        .civic-hero-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .civic-hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        .civic-hero-subtitle {
          font-size: 1.2rem;
          color: #E2E8F0;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .civic-hero-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .civic-btn-primary {
          background-color: #48BB78;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          text-decoration: none;
          transition: transform 0.2s, background-color 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .civic-btn-primary:hover {
          background-color: #38A169;
          transform: translateY(-2px);
        }
        .civic-btn-secondary {
          background-color: white;
          color: #2B6CB0;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          text-decoration: none;
          transition: transform 0.2s, background-color 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .civic-btn-secondary:hover {
          background-color: #EBF8FF;
          transform: translateY(-2px);
        }

        /* --- Section Shared --- */
        .civic-section {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .civic-section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 900;
          color: #2D3748;
          margin-bottom: 50px;
        }

        /* --- Features Grid --- */
        .civic-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }
        .civic-feature-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          text-align: center;
          border-top: 4px solid #48BB78;
        }
        .civic-feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .civic-feature-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #2D3748;
          margin-bottom: 15px;
        }
        .civic-feature-desc {
          color: #718096;
          line-height: 1.6;
        }

        /* --- Tech Stack & Architecture --- */
        .civic-tech-section {
          background-color: white;
          border-radius: 20px;
          padding: 60px 40px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
          margin-top: 40px;
        }
        
        .civic-arch-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .civic-arch-grid { grid-template-columns: 1fr; }
        }

        .civic-tech-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }
        .civic-tech-badge {
          background-color: #EBF8FF;
          color: #2B6CB0;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
          border: 1px solid #BEE3F8;
        }

        .civic-microservice-highlight {
          background: linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%);
          border: 2px solid #9AE6B4;
          border-radius: 16px;
          padding: 30px;
          position: relative;
        }
        .civic-microservice-highlight h3 {
          color: #276749;
          font-size: 1.5rem;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .civic-microservice-highlight p {
          color: #2F855A;
          line-height: 1.6;
          font-size: 1.05rem;
        }

        .civic-architecture-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .civic-architecture-list li {
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        .civic-arch-bullet {
          background-color: #2B6CB0;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .civic-arch-text h4 {
          margin: 0 0 5px 0;
          color: #2D3748;
          font-size: 1.1rem;
        }
        .civic-arch-text p {
          margin: 0;
          color: #718096;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* --- Footer --- */
        .civic-footer {
          background-color: #1A202C;
          color: #A0AEC0;
          text-align: center;
          padding: 40px 20px;
          margin-top: 60px;
        }
      `}</style>

      <div className="civic-home-layout">
        <Navbar />

        {/* Hero Section */}
        <section className="civic-hero">
          <div className="civic-hero-container">
            <h1 className="civic-hero-title">Empowering Communities with AI-Driven Civic Action</h1>
            <p className="civic-hero-subtitle">
              CivicConnect bridges the gap between citizens and local authorities. Report infrastructure issues, auto-generate descriptions using Gemini AI, verify resolutions intelligently, and chat directly with community members to drive real change.
            </p>
            <div className="civic-hero-buttons">
              <Link to="/add-problem" className="civic-btn-primary">📸 Report an Issue</Link>
              <Link to="/problems" className="civic-btn-secondary">🔍 Browse Community Issues</Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="civic-section">
          <h2 className="civic-section-title">How It Works</h2>
          <div className="civic-features-grid">
            <div className="civic-feature-card">
              <div className="civic-feature-icon">📸</div>
              <h3 className="civic-feature-title">1. Snap & Upload</h3>
              <p className="civic-feature-desc">Take a photo of a pothole, broken streetlight, or garbage pile. Upload it instantly using your device.</p>
            </div>
            <div className="civic-feature-card">
              <div className="civic-feature-icon">🤖</div>
              <h3 className="civic-feature-title">2. AI Auto-Analysis</h3>
              <p className="civic-feature-desc">Our integrated  AI scans the image, automatically categorizes the issue, and writes a detailed description for you.</p>
            </div>
            <div className="civic-feature-card">
              <div className="civic-feature-icon">💬</div>
              <h3 className="civic-feature-title">3. Collaborate & Chat</h3>
              <p className="civic-feature-desc">Connect with the person who reported the issue via real-time WebSockets to coordinate cleanup or repairs.</p>
            </div>
            <div className="civic-feature-card">
              <div className="civic-feature-icon">✅</div>
              <h3 className="civic-feature-title">4. AI Verification</h3>
              <p className="civic-feature-desc">Once fixed, upload a new photo. The AI Inspector compares "before" and "after" to verify the resolution.</p>
            </div>
          </div>
        </section>

        {/* Architecture & Tech Stack Section */}
        <section className="civic-section" style={{ paddingTop: '0' }}>
          <div className="civic-tech-section">
            <h2 className="civic-section-title" style={{ marginBottom: '30px' }}>Powered by Modern Architecture</h2>
            
            <div className="civic-tech-badges" style={{ justifyContent: 'center' }}>
              <span className="civic-tech-badge">React.js</span>
              <span className="civic-tech-badge">Node.js / Express</span>
              <span className="civic-tech-badge">MongoDB / Mongoose</span>
              <span className="civic-tech-badge">Socket.io</span>
              <span className="civic-tech-badge">FastAPI (Python)</span>
              <span className="civic-tech-badge">AI</span>
              <span className="civic-tech-badge">OpenStreetMap API</span>
            </div>

            <div className="civic-arch-grid">
              
              {/* Left Column: List */}
              <ul className="civic-architecture-list">
                <li>
                  <div className="civic-arch-bullet">1</div>
                  <div className="civic-arch-text">
                    <h4>Core API (Node.js & Express)</h4>
                    <p>Handles user authentication, JWT sessions, CRUD operations for problems, voting logic, and comments. Stores structural data in MongoDB.</p>
                  </div>
                </li>
                <li>
                  <div className="civic-arch-bullet">2</div>
                  <div className="civic-arch-text">
                    <h4>Real-time Comms (Socket.io)</h4>
                    <p>Attached to the Node.js server, it tracks online users and facilitates instant 1-on-1 private messaging between citizens and NGOs.</p>
                  </div>
                </li>
                <li>
                  <div className="civic-arch-bullet">3</div>
                  <div className="civic-arch-text">
                    <h4>Dynamic Frontend (React)</h4>
                    <p>A responsive UI that seamlessly bridges API requests to the Node core and multipart form-data requests to the Python microservice.</p>
                  </div>
                </li>
              </ul>

              {/* Right Column: Microservice Highlight */}
              <div className="civic-microservice-highlight">
                <h3>🐍 The Python AI Microservice</h3>
                <p>
                  <strong>Why a dedicated microservice?</strong> <br/><br/>
                  Image processing and AI generation are computationally heavy. By decoupling these features into a separate <strong>FastAPI</strong> server, the main Node.js application remains incredibly fast and non-blocking for normal web traffic and real-time chat.
                </p>
                <p style={{ marginTop: '15px' }}>
                  The FastAPI server handles binary image uploads using <code>PIL</code> (Pillow) and communicates directly with the <strong>Google Gemini Generative AI</strong> SDK to execute complex prompts requiring strict JSON schemas.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="civic-footer">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>🌱 CivicConnect</p>
            <p>© {new Date().getFullYear()} CivicConnect Platform. All rights reserved.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Built with MERN, FastAPI, and Gemini AI.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default HomeContent;