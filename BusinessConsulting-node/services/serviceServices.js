const {Service} = require('../models/associations.js'); // מודל שירות


// פונקציה לבדוק את תקינות נתוני השירות
const validateServiceData = (serviceData) => {
    if (!serviceData.name || typeof serviceData.name !== 'string' || serviceData.name.trim() === '') {
        throw new Error('Invalid name: must be a non-empty string');
    }
    if (serviceData.description && typeof serviceData.description !== 'string') {
        throw new Error('Invalid description: must be a string');
    }
    if (serviceData.duration === undefined || typeof serviceData.duration !== 'number' || serviceData.duration <= 0) {
        throw new Error('Invalid duration: must be a positive number');
    }
    if (serviceData.price === undefined || typeof serviceData.price !== 'number' || serviceData.price < 0) {
        throw new Error('Invalid price: must be a non-negative number');
    }
};

// Create
const createService = async (serviceData) => {
    validateServiceData(serviceData); // בדיקות תקינות
    return await Service.create(serviceData);
};

// Read (Get All)
const getAllServices = async () => {
    return await Service.findAll();
};

// Read (Get by ID)
const getServiceById = async (id) => {
    if (id === undefined || typeof id !== 'number') {
        throw new Error('Invalid ID: must be a number');
    }
    const service = await Service.findByPk(id);
    if (!service) {
        throw new Error('Service not found');
    }
    return service;
};

// Update
const updateService = async (id, serviceData) => {
    if (id === undefined || typeof id !== 'number') {
        throw new Error('Invalid ID: must be a number');
    }
    validateServiceData(serviceData); // בדיקות תקינות
    const service = await Service.findByPk(id);
    if (!service) {
        throw new Error('Service not found');
    }
    return await service.update(serviceData);
};

// Delete
const deleteService = async (id) => {
    if (id === undefined || typeof id !== 'number') {
        throw new Error('Invalid ID: must be a number');
    }
    const service = await Service.findByPk(id);
    if (!service) {
        throw new Error('Service not found');
    }
    await service.destroy();
    return true;
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
