const BusinessConsultant = require('../models/businessConsultantModel');

const BusinessConsultantService = {
    createConsultant: async (data) => {
        return await BusinessConsultant.create(data);
    },

    getAllConsultants: async () => {      
        return await BusinessConsultant.findAll();
    },

    getConsultantById: async (id) => {
        return await BusinessConsultant.findByPk(id);
    },

    updateConsultant: async (id, data) => {
        const consultant = await BusinessConsultant.findByPk(id);
        if (!consultant) return null;
        return await consultant.update(data);
    },

    deleteConsultant: async (id) => {
        const consultant = await BusinessConsultant.findByPk(id);
        if (!consultant) return null;
        await consultant.destroy();
        return consultant;
    }
};

module.exports = BusinessConsultantService;
