const { Client } = require('../models/associations.js');
const BusinessConsultant = require('../models/businessConsultantModel.js');
const jwt = require('jsonwebtoken');

const getProfile = async (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const role = decoded.role;

        console.log(decoded);

        if (role !== 'client' && role !== 'manager' && role !== 'consultant') {
            throw new Error('Access denied');
        }
        if (role === 'manager' || role === 'consultant') {
            const businessConsultant = await BusinessConsultant.findOne({ 
                where: { email },
                attributes: ['id', 'name', 'email', 'role', 'profile_image', /*'phone'*/]
            });
            if (!businessConsultant) {
                throw new Error('BusinessConsultant not found');
            }
            return {
                id: businessConsultant.id,
                name: businessConsultant.name,
                phone: businessConsultant.phone,
                email: businessConsultant.email,
                role: businessConsultant.role, // ישאיר את זה כפי שהוגדר
                profile_image: businessConsultant.profile_image || null
            };
        }

        
        

        const client = await Client.findOne({ 
            where: { email: email },
            attributes: ['id', 'name', 'email', 'phone', 'profile_image'] // רק השדות שקיימים
        });
        if (!client) {
            throw new Error('Client not found');
        }

        return {
            id: client.id,
            name: client.name,
            phone: client.phone,
            email: client.email,
            role: 'client',
            profile_image: client.profile_image || null
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getProfile,
};
