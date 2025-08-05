const express = require('express');
//require('../api-docs/businessSwagger');
const router = express.Router();
const {
    createBusinessDetail,
    getBusinessDetails,
    updateBusinessDetail,
    deleteBusinessDetail
} = require('../controllers/businessDetailController');

// Route ליצירת פרטי עסק

router.post('/', createBusinessDetail);

// Route לקבלת כל פרטי העסק
router.get('/', getBusinessDetails);

// Route לעדכון פרטי עסק לפי ID
router.put('/:id', updateBusinessDetail);

// Route למחיקת פרטי עסק לפי ID
router.delete('/:id', deleteBusinessDetail);

module.exports = router;