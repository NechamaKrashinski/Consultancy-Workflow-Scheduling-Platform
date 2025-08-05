const BusinessConsultantService = require('../services/consultantServiceService.js');

const createConsultantService = async (req, res) => {
    
    try {
        const consultantService = await BusinessConsultantService.createConsultantService(req.body);
        res.status(201).json(consultantService);
    } catch (err) {
        console.error(err);
        if (err.message === 'Please provide both consultant_id and service_id') {
            return res.status(400).send(err.message);
        } else if (err.message === 'This consultant-service relationship already exists') {
            return res.status(409).send(err.message);
        } else if (err.message === 'Error creating consultant-service relationship') {
            return res.status(500).send(err.message);
        }
        res.status(500).send('Error creating consultant-service relationship');
    }
}

const deleteConsultantService = async (req, res) => {
    try {
        const { consultant_id, service_id } = req.params;
        const result = await BusinessConsultantService.deleteConsultantService(consultant_id, service_id); // שים לב לשם המתוקן
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        if (err.message === 'Please provide both consultant_id and service_id') {
            return res.status(400).send(err.message);
        } else if (err.message === 'Consultant-service relationship not found') {
            return res.status(404).send(err.message);
        }
        res.status(500).send('Error deleting consultant-service relationship');
    }
}

module.exports = {
    createConsultantService,
    deleteConsultantService
};