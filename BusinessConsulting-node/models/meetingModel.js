const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');

const Meeting = BusinessConsulting.define('Meeting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    business_hour_id: {
        type: DataTypes.INTEGER,
        allowNull: false
        // הreferences יוגדרו ב-associations.js
    },
    client_id: { 
        type: DataTypes.INTEGER
        // הreferences יוגדרו ב-associations.js
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // הreferences יוגדרו ב-associations.js
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
    status: {
        type: DataTypes.ENUM('pending','booked','confirmed','completed','cancelled'),
        defaultValue: 'confirmed'  // אישור מיידי
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: {
                args: [0, 250],
                msg: "The notes must be between 0 and 250 characters long."
            }
        }
    }
}, {
    tableName: 'Meeting',
    timestamps: false
});

module.exports = Meeting;