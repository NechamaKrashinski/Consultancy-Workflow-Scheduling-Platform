const express = require('express');

const router = express.Router();
const {
    createClient,
    getClients,
    updateClient,
    deleteClient
} = require('../controllers/clientController');

// Route ליצירת לקוח
router.post('/', createClient);

// Route לקבלת כל הלקוחות
router.get('/', getClients);

// Route לעדכון לקוח לפי ID
router.put('/:id', updateClient);

// Route למחיקת לקוח לפי ID
router.delete('/:id', deleteClient);

module.exports = router;