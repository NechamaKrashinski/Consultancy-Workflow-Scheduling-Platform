const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');

const ConsultantService = BusinessConsulting.define('ConsultantService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultant_id: {
        type: DataTypes.INTEGER
        // הreferences יוגדרו ב-associations.js
    },
    service_id: {
        type: DataTypes.INTEGER
        // הreferences יוגדרו ב-associations.js
    },
}, {
    tableName: 'ConsultantService',
    timestamps: false,
});

module.exports = ConsultantService;