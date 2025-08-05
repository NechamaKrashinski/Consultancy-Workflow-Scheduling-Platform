const BusinessConsultantService = require('../services/businessConsultantService');

class BusinessConsultantController {
    static async createConsultant(req, res) {
        try {
            const consultant = await BusinessConsultantService.createConsultant(req.body);
            res.status(201).json(consultant);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllConsultants(req, res) {
        try {
            const consultants = await BusinessConsultantService.getAllConsultants();
            res.status(200).json(consultants);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getConsultantById(req, res) {
        try {
            const consultant = await BusinessConsultantService.getConsultantById(req.params.id);
            if (!consultant) {
                return res.status(404).json({ message: 'Consultant not found' });
            }
            res.status(200).json(consultant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateConsultant(req, res) {
        try {
            const updatedConsultant = await BusinessConsultantService.updateConsultant(req.params.id, req.body);
            if (!updatedConsultant) {
                return res.status(404).json({ message: 'Consultant not found' });
            }
            res.status(200).json(updatedConsultant);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async deleteConsultant(req, res) {
        try {
            const deletedConsultant = await BusinessConsultantService.deleteConsultant(req.params.id);
            if (!deletedConsultant) {
                return res.status(404).json({ message: 'Consultant not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BusinessConsultantController;
