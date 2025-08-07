const DataTypes = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');

const Client = BusinessConsulting.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    tableName: 'Client',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Client;