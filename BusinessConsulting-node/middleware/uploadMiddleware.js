const multer = require('multer');
const path = require('path');
const fs = require('fs');

// הגדרת אחסון לתמונות פרופיל
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/profiles');
        // וודא שהתיקייה קיימת
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // שם קובץ בטוח: userType_userId_timestamp.extension
        const userType = req.body.userType || 'user'; // client או consultant
        const userId = req.user?.id || req.client?.id || 'unknown';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname).toLowerCase();
        
        const safeFilename = `${userType}_${userId}_${timestamp}${extension}`;
        cb(null, safeFilename);
    }
});

// הגדרת אחסון למסמכים
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || req.client?.id || 'unknown';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname).toLowerCase();
        
        const safeFilename = `doc_${userId}_${timestamp}${extension}`;
        cb(null, safeFilename);
    }
});

// פילטר קבצים - רק תמונות לפרופיל
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('רק קבצי תמונה מותרים (JPG, PNG, GIF, WebP)'), false);
    }
};

// פילטר קבצים - מסמכים
const documentFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/pdf',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('סוג קובץ לא נתמך. מותר: תמונות, PDF, Word'), false);
    }
};

// הגדרת multer לתמונות פרופיל
const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB מקסימום
        files: 1 // קובץ אחד בלבד
    }
}).single('profileImage'); // שם השדה בטופס

// הגדרת multer למסמכים
const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB מקסימום למסמכים
        files: 1
    }
}).single('document');

// Middleware עם טיפול בשגיאות
const handleProfileUpload = (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'קובץ גדול מדי. מקסימום 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'שגיאה בהעלאת קובץ: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

const handleDocumentUpload = (req, res, next) => {
    uploadDocument(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'קובץ גדול מדי. מקסימום 10MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'שגיאה בהעלאת מסמך: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = {
    handleProfileUpload,
    handleDocumentUpload
};
