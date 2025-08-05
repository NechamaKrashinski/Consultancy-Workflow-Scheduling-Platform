const {Client} = require('../models/associations.js');

const createClient = async (req, res) => {
    try {
        const client = await Client.create(req.body);
        res.status(201).json(client);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating client');
    }
};

const getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching clients');
    }
};

const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        await Client.update(req.body, { where: { id } });
        res.status(200).send('Client updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating client');
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await Client.destroy({ where: { id } });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting client');
    }
};

module.exports = {
    createClient,
    getClients,
    updateClient,
    deleteClient,
};