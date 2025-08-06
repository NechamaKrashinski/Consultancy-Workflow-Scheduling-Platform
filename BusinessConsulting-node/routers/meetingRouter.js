
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    createMeetingController,
    getMeetingsController,
    updateMeetingController,
    deleteMeetingController,
    getAvailableTimesController,
    getConsultantsByServiceController
} = require('../controllers/meetingController.js');

router.post('/', createMeetingController);
router.get('/client/:clientId', getMeetingsController);
router.get('/client', authenticateToken, getMeetingsController); // עבור לקוח מ-token
router.get('/manager', getMeetingsController); // עבור מנהלים
router.put('/:id', updateMeetingController);
router.delete('/:id', deleteMeetingController);
router.post('/available-times', getAvailableTimesController);
router.get('/consultants/:serviceId', getConsultantsByServiceController);

module.exports = router;