const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');
const {BusinessConsultant} = require('./associations.js');

const BusinessHours = BusinessConsulting.define('BusinessHours', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    business_consultant_id: {
        type: DataTypes.INTEGER,
        references: {
            model: BusinessConsultant, 
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    tableName: 'BusinessHours',
    timestamps: false,
});

module.exports = BusinessHours;