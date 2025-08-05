require('dotenv').config();
const Sequelize = require('sequelize');

const BusinessConsulting = new Sequelize('BusinessConsulting',process.env.DB_USER, process.env.DB_PASSWORD, { // <--- כאן השינויים!
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mssql',
    port: process.env.DB_PORT || 1433, 
    dialectOptions: {
        encrypt: false, 
        trustServerCertificate: true 
    },
    logging: false
});

module.exports = BusinessConsulting;