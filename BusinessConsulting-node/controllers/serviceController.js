const serviceService = require('../services/serviceService.js');

// קונטרולר לניהול שירותים
const createService = async (req, res) => {
    try {
        const serviceData = req.body;
        const service = await serviceService.createService(serviceData);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getServiceById(Number(id));
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceData = req.body;
        const updatedService = await serviceService.updateService(Number(id), serviceData);
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await serviceService.deleteService(Number(id));
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};

