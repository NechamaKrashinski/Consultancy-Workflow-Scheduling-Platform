const BusinessDetail = require('../models/businessDetailsModel.js');

const createBusinessDetail = async (req, res) => {
    try {
        const businessDetail = await BusinessDetail.create(req.body);
        res.status(201).json(businessDetail);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating business detail');
    }
};

const getBusinessDetails = async (req, res) => {
    try {
        const businessDetails = await BusinessDetail.findAll();
        res.json(businessDetails);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching business details');
    }
};

const updateBusinessDetail = async (req, res) => {
    try {
        const { id } = req.params;
        await BusinessDetail.update(req.body, { where: { id } });
        res.status(200).send('Business detail updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating business detail');
    }
};

const deleteBusinessDetail = async (req, res) => {
    try {
        const { id } = req.params;
        await BusinessDetail.destroy({ where: { id } });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting business detail');
    }
};

module.exports = {
    createBusinessDetail,
    getBusinessDetails,
    updateBusinessDetail,
    deleteBusinessDetail,
};