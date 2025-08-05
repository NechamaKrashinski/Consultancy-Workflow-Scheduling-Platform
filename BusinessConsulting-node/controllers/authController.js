const AuthService = require('../services/authService');
const asyncHandler = require('express-async-handler');

const registerClient = asyncHandler(async (req, res) => {
    try {
        console.log('Received client registration request');
        const token = await AuthService.registerClient(req.body);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const token = await AuthService.login(req.body);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

const registerBusinessConsultant = asyncHandler(async (req, res) => {
    try {
        console.log('Received business consultant registration request');
        const token = await AuthService.registerBusinessConsultant(req.body);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    registerClient,
    login,
    registerBusinessConsultant
};
