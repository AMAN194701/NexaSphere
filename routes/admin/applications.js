const rateLimit = require('express-rate-limit');

// Rate limiter for admin endpoints
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
const express = require('express');
const router = express.Router();
const ApplicationController = require('../../controllers/admin/applicationsController');
const { isAdmin } = require('../../middleware/auth');

router.use(isAdmin);
router.use(adminLimiter);

router.get('/pending', ApplicationController.getPending);
router.post('/:id/approve', ApplicationController.approve);
router.post('/:id/reject', ApplicationController.reject);
router.get('/timeline', ApplicationController.getTimeline);

module.exports = router;
