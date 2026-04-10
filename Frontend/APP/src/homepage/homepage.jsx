import React, { useState } from 'react';
import { Link, BrowserRouter, useLocation } from 'react-router-dom';
import './homepage.css'; // Assuming you have a CSS file for styling
 import Navbar from '../navbar/navbar';

const HomeContent = () => {
  return (
    <>
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