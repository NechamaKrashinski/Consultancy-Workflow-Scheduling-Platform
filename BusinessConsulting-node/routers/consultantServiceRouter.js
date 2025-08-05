const express = require('express');
const router = express.Router();

const {
    createConsultantService,
    deleteConsultantService}=require('../controllers/consultantServiceController')

router.post('/', createConsultantService); 
router.delete('/', deleteConsultantService);

module.exports = router;
