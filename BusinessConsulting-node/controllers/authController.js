const AuthService = require('../services/authService');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// Standardized response helper
const createResponse = (success, message, data = null, error = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data) response.data = data;
    if (error) response.error = error;
    
    return response;
};

const registerClient = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    try {
        logger.auth.attempt('client_registration', email, { 
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // בדיקת נתונים בסיסית נוספת
        const requiredFields = ['name', 'email', 'password', 'phone'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            logger.auth.failure('client_registration', email, 'missing_fields', {
                missingFields,
                ip: req.ip
            });
            
            return res.status(400).json(createResponse(
                false,
                `השדות הבאים חסרים: ${missingFields.join(', ')}`,
                null,
                { missingFields, code: 'MISSING_FIELDS' }
            ));
        }

        logger.info('Processing client registration request', {
            email,
            ip: req.ip,
            hasRequiredFields: true
        });
        
        const token = await AuthService.registerClient(req.body);
        
        logger.auth.success('client_registration', { email, role: 'client' }, {
            ip: req.ip,
            timestamp: new Date()
        });
        
        res.status(201).json(createResponse(
            true,
            'לקוח נרשם בהצלחה',
            { token, userType: 'client' }
        ));
    } catch (error) {
        logger.auth.failure('client_registration', email, error.message, {
            ip: req.ip,
            errorStack: error.stack
        });
        
        logger.error('Client registration failed', error, {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(400).json(createResponse(
            false,
            error.message,
            null,
            { code: 'REGISTRATION_FAILED', type: 'client' }
        ));
    }
});

const login = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    try {
        logger.auth.attempt('login', email, { 
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // בדיקת נתונים בסיסית
        if (!req.body.email || !req.body.password) {
            logger.auth.failure('login', email || 'unknown', 'missing_credentials', {
                ip: req.ip
            });
            
            return res.status(400).json(createResponse(
                false,
                'נדרש להזין אימייל וסיסמה',
                null,
                { code: 'MISSING_CREDENTIALS' }
            ));
        }

        const result = await AuthService.login(req.body);
        
        logger.auth.success('login', { email }, {
            ip: req.ip,
            loginTime: new Date()
        });
        
        res.status(200).json(createResponse(
            true,
            'התחברות בוצעה בהצלחה',
            { 
                token: result.token || result,
                loginTime: new Date().toISOString()
            }
        ));
    } catch (error) {
        logger.auth.failure('login', email, error.message, {
            ip: req.ip,
            errorType: error.name
        });
        
        logger.error('Login failed', error, {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(401).json(createResponse(
            false,
            error.message,
            null,
            { code: 'AUTHENTICATION_FAILED' }
        ));
    }
});

const registerBusinessConsultant = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    try {
        logger.auth.attempt('consultant_registration', email, { 
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // בדיקת נתונים בסיסית נוספת
        const requiredFields = ['first_name', 'last_name', 'email', 'password', 'phone', 'expertise', 'experience_years'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            logger.auth.failure('consultant_registration', email, 'missing_fields', {
                missingFields,
                ip: req.ip
            });
            
            return res.status(400).json(createResponse(
                false,
                `השדות הבאים חסרים: ${missingFields.join(', ')}`,
                null,
                { missingFields, code: 'MISSING_FIELDS' }
            ));
        }

        logger.info('Processing business consultant registration request', {
            email,
            experience_years: req.body.experience_years,
            ip: req.ip
        });
        
        const token = await AuthService.registerBusinessConsultant(req.body);
        
        logger.auth.success('consultant_registration', { email, role: 'consultant' }, {
            ip: req.ip,
            experience_years: req.body.experience_years
        });
        
        res.status(201).json(createResponse(
            true,
            'יועץ עסקי נרשם בהצלחה',
            { token, userType: 'consultant' }
        ));
    } catch (error) {
        logger.auth.failure('consultant_registration', email, error.message, {
            ip: req.ip,
            errorStack: error.stack
        });
        
        logger.error('Business consultant registration failed', error, {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(400).json(createResponse(
            false,
            error.message,
            null,
            { code: 'REGISTRATION_FAILED', type: 'consultant' }
        ));
    }
});

module.exports = {
    registerClient,
    login,
    registerBusinessConsultant
};
