const joi = require('joi');

// בדיקות בסיסיות
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // לפחות 8 תווים, אות גדולה, אות קטנה, מספר
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const validatePhone = (phone) => {
    // פורמט ישראלי: 05X-XXXXXXX או 05XXXXXXXXX
    const phoneRegex = /^05\d{1}-?\d{7}$/;
    return phoneRegex.test(phone);
};

// Schemas עבור validation
const schemas = {
    // רישום לקוח
    clientRegistration: joi.object({
        name: joi.string().min(2).max(100).required()
            .pattern(/^[a-zA-Zא-ת\s]+$/)
            .messages({
                'string.pattern.base': 'שם יכול להכיל רק אותיות ורווחים',
                'string.min': 'שם חייב להיות לפחות 2 תווים',
                'string.max': 'שם לא יכול להיות יותר מ-100 תווים'
            }),
        
        email: joi.string().email().required()
            .messages({
                'string.email': 'כתובת אימייל לא תקינה'
            }),
        
        password: joi.string().min(8).required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#]{8,}$/)
            .messages({
                'string.pattern.base': 'סיסמה חייבת להכיל לפחות אות גדולה, אות קטנה ומספר',
                'string.min': 'סיסמה חייבת להיות לפחות 8 תווים'
            }),
        
        phone: joi.string().pattern(/^05\d{1}-?\d{7}$/).required()
            .messages({
                'string.pattern.base': 'מספר טלפון לא תקין (פורמט: 05X-XXXXXXX)'
            }),
        
        address: joi.string().min(5).max(200).optional()
            .messages({
                'string.min': 'כתובת חייבת להיות לפחות 5 תווים',
                'string.max': 'כתובת לא יכולה להיות יותר מ-200 תווים'
            })
    }),

    // רישום יועץ עסקי
    consultantRegistration: joi.object({
        first_name: joi.string().min(2).max(50).required()
            .pattern(/^[a-zA-Zא-ת\s]+$/),
        
        last_name: joi.string().min(2).max(50).required()
            .pattern(/^[a-zA-Zא-ת\s]+$/),
        
        email: joi.string().email().required(),
        
        password: joi.string().min(8).required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/),
        
        phone: joi.string().pattern(/^05\d{1}-?\d{7}$/).required(),
        
        expertise: joi.string().min(10).max(500).required()
            .messages({
                'string.min': 'תיאור התמחות חייב להיות לפחות 10 תווים',
                'string.max': 'תיאור התמחות לא יכול להיות יותר מ-500 תווים'
            }),
        
        experience_years: joi.number().integer().min(0).max(50).required()
            .messages({
                'number.min': 'שנות ניסיון לא יכולות להיות שליליות',
                'number.max': 'שנות ניסיון לא יכולות להיות יותר מ-50'
            })
    }),

    // התחברות
    login: joi.object({
        email: joi.alternatives().try(
            joi.string().email(),
            joi.string().valid('n@n') // מאפשר את המייל הספציפי n@n
        ).required()
            .messages({
                'alternatives.match': 'כתובת אימייל לא תקינה'
            }),
        
        password: joi.string().min(1).required()
            .messages({
                'string.empty': 'סיסמה נדרשת'
            })
    }),

    // יצירת פגישה
    createMeeting: joi.object({
        businessHourId: joi.number().integer().positive().required()
            .messages({
                'number.positive': 'מזהה שעות עסקים חייב להיות חיובי'
            }),
        
        serviceId: joi.number().integer().positive().required()
            .messages({
                'number.positive': 'מזהה שירות חייב להיות חיובי'
            }),
        
        clientId: joi.number().integer().positive().required()
            .messages({
                'number.positive': 'מזהה לקוח חייב להיות חיובי'
            }),
        
        date: joi.date().iso().min('now').required()
            .messages({
                'date.min': 'תאריך הפגישה חייב להיות בעתיד',
                'date.iso': 'פורמט תאריך לא תקין'
            }),
        
        startTime: joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
            .messages({
                'string.pattern.base': 'פורמט שעת התחלה לא תקין (HH:MM)'
            }),
        
        endTime: joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
            .messages({
                'string.pattern.base': 'פורמט שעת סיום לא תקין (HH:MM)'
            }),
        
        notes: joi.string().max(1000).optional()
            .messages({
                'string.max': 'הערות לא יכולות להיות יותר מ-1000 תווים'
            })
    }),

    // עדכון פגישה
    updateMeeting: joi.object({
        date: joi.date().iso().min('now').optional(),
        startTime: joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        endTime: joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        notes: joi.string().max(1000).optional(),
        status: joi.string().valid('scheduled', 'completed', 'cancelled').optional()
    }).min(1) // לפחות שדה אחד נדרש
};

// Middleware function
const validate = (schema) => {
    return (req, res, next) => {
        // בדיקה שהבקשה מכילה body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'גוף הבקשה לא יכול להיות רק',
                details: 'נדרש לשלוח נתונים בגוף הבקשה'
            });
        }

        const { error, value } = schemas[schema].validate(req.body, {
            abortEarly: false, // החזר את כל השגיאות
            stripUnknown: true // הסר שדות לא מוכרים
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                rejectedValue: detail.context.value
            }));

            return res.status(400).json({
                error: 'Validation Error',
                message: 'הנתונים שנשלחו לא תקינים',
                details: errorDetails
            });
        }

        // החלף את req.body בנתונים המוולדים (נקיים)
        req.body = value;
        next();
    };
};

// בדיקות נוספות
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid ID',
            message: 'מזהה לא תקין',
            details: 'המזהה חייב להיות מספר חיובי'
        });
    }
    
    req.params.id = id;
    next();
};

const sanitizeInput = (req, res, next) => {
    // הסרת תווים מסוכנים מכל הנתונים
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // הסרת script tags ותווים מסוכנים
                obj[key] = obj[key].replace(/<script[^>]*>.*?<\/script>/gi, '')
                                 .replace(/<[^>]*>/g, '')
                                 .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    if (req.query) sanitize(req.query);
    
    next();
};

module.exports = {
    validate,
    validateId,
    sanitizeInput,
    schemas
};
