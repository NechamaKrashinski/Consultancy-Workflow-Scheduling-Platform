const express = require('express');
const router = express.Router();
const {
    readBusinessHoursByConsultant,
    createBusinessHours,
    putBusinessHours
} = require('../controllers/businessHoursController');

router.post('/', createBusinessHours);
router.get('/:consultantId', readBusinessHoursByConsultant);
router.put('/:consultantId', putBusinessHours);

module.exports = router;