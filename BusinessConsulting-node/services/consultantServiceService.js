const { ConsultantService } = require('../models/associations.js');

const createConsultantService = async (data) => {
    const { consultant_id, service_id } = data;
    console.log("Creating consultant-service relationship with data:", data);
    
    if (!consultant_id || !service_id) {
        throw new Error('Please provide both consultant_id and service_id');
    }

    const existingConsultantService = await ConsultantService.findOne({
        where: { consultant_id, service_id }
    });

    if (existingConsultantService) {
        throw new Error('This consultant-service relationship already exists');
    }

    const consultantService = await ConsultantService.create({
        consultant_id,
        service_id
    });

    if (!consultantService) {
        throw new Error('Error creating consultant-service relationship');
    }

    return consultantService;
}

const deleteConsultantService = async (consultant_id, service_id) => { // שים לב לשם המתוקן
    if (!consultant_id || !service_id) {
        throw new Error('Please provide both consultant_id and service_id');
    }

    const consultantService = await ConsultantService.findOne({
        where: { consultant_id, service_id }
    });

    if (!consultantService) {
        throw new Error('Consultant-service relationship not found');
    }

    await ConsultantService.destroy({
        where: { consultant_id, service_id }
    });

    return { message: 'Consultant-service relationship deleted successfully' };
}

module.exports = {
    createConsultantService,
    deleteConsultantService
}


