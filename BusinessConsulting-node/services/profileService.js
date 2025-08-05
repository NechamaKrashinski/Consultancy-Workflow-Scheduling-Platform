const { Client } = require('../models/associations.js');
const BusinessConsultant = require('../models/businessConsultantModel.js');
const jwt = require('jsonwebtoken');

const getProfile = async (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const role = decoded.role;

    if (role !== 'client' && role !== 'manager') {
        throw new Error('Access denied');
    }

    if (role === 'manager') {
        const businessConsultant = await BusinessConsultant.findOne({ where: { email: email } });
        if (!businessConsultant) {
            throw new Error('Manager not found');
        }
        return {
            id: businessConsultant.id,
            name: businessConsultant.name,
            phone: businessConsultant.phone,
            email: businessConsultant.email,
            role: 'manager',
        };
    }

    const client = await Client.findOne({ where: { email: email } });
    if (!client) {
        throw new Error('Client not found');
    }

    return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        role: 'client',
    };
};

module.exports = {
    getProfile,
};
