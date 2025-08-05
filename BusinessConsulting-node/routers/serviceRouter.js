const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController.js');

// נתיב ליצירת שירות
router.post('/', serviceController.createService);

// נתיב לקבלת כל השירותים
router.get('/', serviceController.getAllServices);

// נתיב לקבלת שירות לפי מזהה
router.get('/:id', serviceController.getServiceById);

// נתיב לעדכון שירות
router.put('/:id', serviceController.updateService);

// נתיב למחיקת שירות
router.delete('/:id', serviceController.deleteService);

module.exports = router;
