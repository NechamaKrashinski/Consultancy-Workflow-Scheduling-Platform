const express = require('express');
const router = express.Router();
const BusinessConsultantController = require('../controllers/businessConsultantController');

// Create a new consultant
router.post('/', BusinessConsultantController.createConsultant);

// Read all consultants
router.get('/', BusinessConsultantController.getAllConsultants);

// Read a consultant by ID
router.get('/:id', BusinessConsultantController.getConsultantById);

// Update a consultant by ID
router.put('/:id', BusinessConsultantController.updateConsultant);

// Delete a consultant by ID
router.delete('/:id', BusinessConsultantController.deleteConsultant);

module.exports = router;
