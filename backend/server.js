const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env first
dotenv.config();

// Connect Database
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/interview',  require('./routes/interview'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/feedback',   require('./routes/feedback'));

// ─── Health Check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ NexaSphere API Running',
    version: '1.0.0',
    status:  'OK'
  });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});