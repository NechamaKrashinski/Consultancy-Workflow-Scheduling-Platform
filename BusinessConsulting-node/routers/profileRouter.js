const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const {
    getProfile,
} = require('../controllers/profileController');

// הגנה על כל הנתיבים בנתב זה
router.use(authenticateToken);

router.get('/', getProfile);

module.exports = router;