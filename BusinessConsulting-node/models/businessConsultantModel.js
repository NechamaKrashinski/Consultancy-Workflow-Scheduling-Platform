const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');


const BusinessConsultant = BusinessConsulting.define('BusinessConsultant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue :'consultant',
        validate: {
            isIn: [['manager','consultant']]
        }
    }
}, {
    tableName: 'BusinessConsultant',
    timestamps: false,
});

module.exports = BusinessConsultant;