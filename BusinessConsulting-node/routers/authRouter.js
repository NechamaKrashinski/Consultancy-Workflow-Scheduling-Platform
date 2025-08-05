const express = require('express');
//require('../api-docs/loginSwagger');
const { registerBusinessConsultant,registerClient, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerClient);
router.post('/add-manager', registerBusinessConsultant); // Assuming this is for adding a manager
router.post('/', login);

module.exports = router;
