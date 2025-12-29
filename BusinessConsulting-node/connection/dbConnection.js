require('dotenv').config();
const Sequelize = require('sequelize');

const BusinessConsulting = new Sequelize('BusinessConsulting',process.env.DB_USER, process.env.DB_PASSWORD, { 
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mssql',
    port: process.env.DB_PORT || 1433, 
    dialectOptions: {
        encrypt: process.env.NODE_ENV === 'production', // 🔒 הצפנה רק בפרודקשן
        trustServerCertificate: process.env.NODE_ENV !== 'production' // 🔒 trust רק בדראלופמנט
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false // 🔍 לוגים רק בדראלופמנט
});

module.exports = BusinessConsulting;