# 🌱 CivicConnect 

**CivicConnect** is an AI-driven community platform that empowers citizens to report local infrastructure and environmental issues (like potholes, garbage, and broken streetlights) and connects them directly with community members and authorities to drive real change.

## ✨ Features

- **📸 Snap & Upload:** Easily report community problems with image uploads.
- **🤖 AI Auto-Analysis:** Powered by **API**, the app automatically analyzes uploaded photos to categorize the issue, generate a detailed description, and suggest practical solutions.
- **💬 Real-Time Collaboration:** Integrated **Socket.io** enables instant, private 1-on-1 messaging between citizens to coordinate cleanups or repairs.
- **✅ AI Resolution Verification:** When an issue is marked as fixed, an AI Inspector compares the "before" and "after" photos to verify the quality of the resolution.
- **📍 Location Tagging:** Seamless location searching and filtering using the OpenStreetMap API.
- **👍 Community Voting:** Upvote and downvote issues to prioritize the most critical problems in your area.

## 🛠️ Technology Stack

This project utilizes a modern, decoupled microservice architecture:

**Frontend:**
- React.js
- React Router DOM
- Axios

**Backend (Core API & Real-time):**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (WebSockets)
- JWT Authentication

**AI Microservice (Image Processing):**
- Python & FastAPI
- Google Generative AI SDK (Gemini 1.5)
- Pillow (PIL) for image handling

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- MongoDB (Local or Atlas)
- A Google Gemini API Key
