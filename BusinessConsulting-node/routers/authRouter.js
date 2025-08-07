const express = require('express');
//require('../api-docs/loginSwagger');
const { registerBusinessConsultant,registerClient, login } = require('../controllers/authController');
const { validate, sanitizeInput } = require('../middleware/validationMiddleware');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// הוספת validation, sanitization ו-rate limiting לכל הנתיבים
router.post('/register', registrationLimiter, sanitizeInput, validate('clientRegistration'), registerClient);
router.post('/add-manager', registrationLimiter, sanitizeInput, validate('consultantRegistration'), registerBusinessConsultant);
router.post('/', authLimiter, sanitizeInput, validate('login'), login);

module.exports = router;
