const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');
const BusinessConsultant = require('./businessConsultantModel.js');
const Service = require('./serviceModel.js');

const ConsultantService = BusinessConsulting.define('ConsultantService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultant_id: {
        type: DataTypes.INTEGER,
        references: {
            model: BusinessConsultant,
            key: 'id'
        }
    },
    service_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Service,
            key: 'id'
        }
    },
}, {
    tableName: 'ConsultantService',
    timestamps: false,
});

module.exports = ConsultantService;