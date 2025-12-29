
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate, validateId, sanitizeInput } = require('../middleware/validationMiddleware');
const { meetingLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');
const {
    createMeetingController,
    getMeetingsController,
    updateMeetingController,
    deleteMeetingController,
    getAvailableTimesController,
    getConsultantsByServiceController
} = require('../controllers/meetingController.js');

router.post('/', meetingLimiter, sanitizeInput, validate('createMeeting'), authenticateToken, createMeetingController);
router.get('/client/:clientId', apiLimiter, validateId, authenticateToken, getMeetingsController);
router.get('/client', apiLimiter, authenticateToken, getMeetingsController); // עבור לקוח מ-token
router.get('/manager', apiLimiter, authenticateToken, getMeetingsController); // עבור מנהלים - עם authentication
router.put('/:id', meetingLimiter, validateId, sanitizeInput, validate('updateMeeting'), authenticateToken, updateMeetingController);
router.delete('/:id', meetingLimiter, validateId, authenticateToken, deleteMeetingController);
router.post('/available-times', apiLimiter, sanitizeInput, authenticateToken, getAvailableTimesController);
router.get('/consultants/:serviceId', apiLimiter, validateId, authenticateToken, getConsultantsByServiceController);

module.exports = router;