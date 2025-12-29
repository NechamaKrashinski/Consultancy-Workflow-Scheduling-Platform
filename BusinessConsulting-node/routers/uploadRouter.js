const express = require('express');
const router = express.Router();

// Import controllers and middleware
const { 
    uploadProfileImage, 
    uploadDocument, 
    serveFile, 
    deleteFile 
} = require('../controllers/uploadController');

const { 
    handleProfileUpload, 
    handleDocumentUpload 
} = require('../middleware/uploadMiddleware');

const { authenticateToken } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// נתיבים להעלאת קבצים - דורשים אימות
router.post('/profile-image', 
    apiLimiter, 
    authenticateToken, 
    handleProfileUpload, 
    uploadProfileImage
);

router.post('/document', 
    apiLimiter, 
    authenticateToken, 
    handleDocumentUpload, 
    uploadDocument
);

// נתיב להצגת קבצים - ללא אימות (תמונות פרופיל ציבוריות)
router.get('/:type/:filename', serveFile);

// נתיב למחיקת קבצים - דורש אימות
router.delete('/:type/:filename', 
    apiLimiter, 
    authenticateToken, 
    deleteFile
);

module.exports = router;
