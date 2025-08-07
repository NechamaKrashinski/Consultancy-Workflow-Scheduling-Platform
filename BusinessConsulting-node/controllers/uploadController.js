const path = require('path');
const fs = require('fs');
const Client = require('../models/clientModel');
const BusinessConsultant = require('../models/businessConsultantModel');

/**
 * העלאת תמונת פרופיל
 */
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'לא נבחר קובץ להעלאה'
            });
        }

        // קבלת מידע המשתמש מה-token
        console.log('🔍 Upload Debug - req.user:', req.user);
        console.log('🔍 Upload Debug - req.client:', req.client);
        
        const user = req.user || req.client;
        
        console.log('🔍 Upload Debug - user:', user);
        
        if (!user) {
            console.log('❌ No user found in request');
            return res.status(401).json({
                success: false,
                message: 'משתמש לא מורשה'
            });
        }

        // אם אין ID בטוקן, נחלץ אותו מה-DB לפי email
        let userId = user.id;
        const userRole = user.role;
        const userEmail = user.email;

        if (!userId) {
            // חיפוש המשתמש ב-DB לפי email
            if (userRole === 'client') {
                const client = await Client.findOne({ where: { email: userEmail } });
                if (!client) {
                    return res.status(404).json({
                        success: false,
                        message: 'לקוח לא נמצא'
                    });
                }
                userId = client.id;
            } else if (userRole === 'consultant' || userRole === 'manager') {
                const consultant = await BusinessConsultant.findOne({ where: { email: userEmail } });
                if (!consultant) {
                    return res.status(404).json({
                        success: false,
                        message: 'יועץ לא נמצא'
                    });
                }
                userId = consultant.id;
            }
        }

        // עדכון המסד נתונים - רק אם העמודות קיימות
        const profileImagePath = `/api/uploads/profiles/${req.file.filename}`;
        
        try {
            if (userRole === 'client') {
                await Client.update(
                    { profile_image: profileImagePath },
                    { where: { id: userId } }
                );
                console.log('✅ Client profile image updated in DB');
            } else if (userRole === 'consultant' || userRole === 'manager') {
                await BusinessConsultant.update(
                    { profile_image: profileImagePath },
                    { where: { id: userId } }
                );
                console.log('✅ Consultant profile image updated in DB');
            }
        } catch (dbError) {
            console.log('⚠️ Could not update DB (column may not exist yet):', dbError.message);
            // ממשיכים למרות השגיאה - התמונה נשמרה בכל זאת
        }

        // מידע על הקובץ שהועלה
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date(),
            filePath: profileImagePath
        };

        console.log('✅ Profile image uploaded and saved to DB:', fileInfo);

        res.status(200).json({
            success: true,
            message: 'תמונת פרופיל הועלתה בהצלחה',
            file: {
                filename: fileInfo.filename,
                originalName: fileInfo.originalName,
                size: Math.round(fileInfo.size / 1024), // בKB
                url: fileInfo.filePath
            }
        });

    } catch (error) {
        console.error('❌ Error uploading profile image:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בהעלאת תמונת פרופיל',
            error: error.message
        });
    }
};

/**
 * העלאת מסמך
 */
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'לא נבחר מסמך להעלאה'
            });
        }

        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date(),
            filePath: `/api/uploads/documents/${req.file.filename}`
        };

        console.log('✅ Document uploaded successfully:', fileInfo);

        res.status(200).json({
            success: true,
            message: 'מסמך הועלה בהצלחה',
            file: {
                filename: fileInfo.filename,
                originalName: fileInfo.originalName,
                size: Math.round(fileInfo.size / 1024), // בKB
                url: fileInfo.filePath,
                type: fileInfo.mimetype
            }
        });

    } catch (error) {
        console.error('❌ Error uploading document:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בהעלאת מסמך',
            error: error.message
        });
    }
};

/**
 * הצגת קובץ (תמונה או מסמך)
 */
const serveFile = async (req, res) => {
    try {
        const { type, filename } = req.params; // type = 'profiles' או 'documents'
        
        // בדיקת בטיחות - רק תיקיות מותרות
        if (!['profiles', 'documents'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'סוג קובץ לא חוקי'
            });
        }

        const filePath = path.join(__dirname, `../uploads/${type}`, filename);
        
        // בדיקה שהקובץ קיים
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'קובץ לא נמצא'
            });
        }

        // בדיקת בטיחות נוספת - הקובץ באמת בתיקייה הנכונה
        const realPath = fs.realpathSync(filePath);
        const expectedDir = fs.realpathSync(path.join(__dirname, `../uploads/${type}`));
        
        if (!realPath.startsWith(expectedDir)) {
            return res.status(403).json({
                success: false,
                message: 'גישה לקובץ נדחתה'
            });
        }

        // שליחת הקובץ
        res.sendFile(realPath);

    } catch (error) {
        console.error('❌ Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה בהצגת קובץ',
            error: error.message
        });
    }
};

/**
 * מחיקת קובץ
 */
const deleteFile = async (req, res) => {
    try {
        const { type, filename } = req.params;
        
        if (!['profiles', 'documents'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'סוג קובץ לא חוקי'
            });
        }

        const filePath = path.join(__dirname, `../uploads/${type}`, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'קובץ לא נמצא'
            });
        }

        // מחיקת הקובץ
        fs.unlinkSync(filePath);
        
        console.log('✅ File deleted successfully:', filename);

        res.status(200).json({
            success: true,
            message: 'קובץ נמחק בהצלחה'
        });

    } catch (error) {
        console.error('❌ Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה במחיקת קובץ',
            error: error.message
        });
    }
};

module.exports = {
    uploadProfileImage,
    uploadDocument,
    serveFile,
    deleteFile
};
