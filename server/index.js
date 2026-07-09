// Complete code for server/index.js
/**
 * Server entry point.
 * 
 * @file server/index.js
 * @author Ayushh Sharma
 * @description Server entry point.
 */

// Import required modules
const express = require('express');
const helmet = require('helmet');
const securityMiddleware = require('./middleware/security');

// Create an Express app instance
const app = express();

// Set up middleware
app.use(helmet());
app.use(securityMiddleware);

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});