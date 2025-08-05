const express = require('express');
const router = express.Router();
const businessHoursController = require('../controllers/businessHoursController'); // נתיב לקונטרולר

// נתיב להוסיף שעות עבודה ליועץ
router.post('/', businessHoursController.createBusinessHours);

// נתיב לקבלת שעות עבודה לפי יועץ
router.get('/:consultantId', businessHoursController.getBusinessHoursByConsultant);

// נתיב לקבלת כל שעות העבודה
router.get('/', businessHoursController.getBusinessHours);

// נתיב לעדכון שעות עבודה
router.put('/:business_hours_id', businessHoursController.updateBusinessHours);

module.exports = router;
