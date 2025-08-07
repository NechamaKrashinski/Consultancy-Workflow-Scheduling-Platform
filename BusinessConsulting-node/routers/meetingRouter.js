
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

router.post('/', meetingLimiter, sanitizeInput, validate('createMeeting'), createMeetingController);
router.get('/client/:clientId', apiLimiter, validateId, getMeetingsController);
router.get('/client', apiLimiter, authenticateToken, getMeetingsController); // עבור לקוח מ-token
router.get('/manager', apiLimiter, getMeetingsController); // עבור מנהלים
router.put('/:id', meetingLimiter, validateId, sanitizeInput, validate('updateMeeting'), updateMeetingController);
router.delete('/:id', meetingLimiter, validateId, deleteMeetingController);
router.post('/available-times', apiLimiter, sanitizeInput, getAvailableTimesController);
router.get('/consultants/:serviceId', apiLimiter, validateId, getConsultantsByServiceController);

module.exports = router;