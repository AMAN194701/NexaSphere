// Complete code for server/middleware/security.js
/**
 * Security middleware.
 * 
 * @file server/middleware/security.js
 * @author Ayushh Sharma
 * @description Security middleware.
 */

// Import required modules
const helmet = require('helmet');
const csp = require('helmet-csp');

// Define security middleware
const securityMiddleware = (req, res, next) => {
  // Define Content Security Policy (CSP) directives
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'https://picsum.photos'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://api.example.com'],
  };

  // Set up CSP headers
  res.locals.helmet = helmet({
    contentSecurityPolicy: cspDirectives,
  });

  // Call the next middleware
  next();
};

// Export security middleware
module.exports = securityMiddleware;