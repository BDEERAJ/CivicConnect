import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './config/db.js';
import setupSockets from './sockets/index.js';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app = express();
const server = http.createServer(app); // We need this to bind Socket.io

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Connect Database
connectDB();

// Initialize Socket.io
setupSockets(server);

// Base Route
app.get('/', (req, res) => res.send('Civic Platform API Running'));

// Global Error Handler

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));