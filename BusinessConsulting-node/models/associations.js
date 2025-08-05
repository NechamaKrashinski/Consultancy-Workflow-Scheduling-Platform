const { DataTypes } = require('sequelize');
const BusinessConsulting = require('../connection/dbConnection.js');
const BusinessDetail = require('./businessDetailsModel.js');
const BusinessConsultant = require('./businessConsultantModel.js');
const Client = require('./clientModel.js');
const Service = require('./serviceModel.js');
const Meeting = require('./meetingModel.js');
const BusinessHours = require('./businessHoursModel.js');
const ConsultantService = require('./consultantServiceModel.js');

// הגדרת הקשרים
BusinessConsultant.hasMany(BusinessHours, {
    foreignKey: 'business_consultant_id',
    onDelete: 'CASCADE'
});
BusinessHours.belongsTo(BusinessConsultant, {
    foreignKey: 'business_consultant_id'
});

BusinessHours.hasMany(Meeting, {
    foreignKey: 'business_hour_id',
    onDelete: 'CASCADE'
});
Meeting.belongsTo(BusinessHours, {
    foreignKey: 'business_hour_id'
});

Client.hasMany(Meeting, {
    foreignKey: 'client_id',
    onDelete: 'CASCADE'
});
Meeting.belongsTo(Client, {
    foreignKey: 'client_id'
});

Service.hasMany(ConsultantService, {
    foreignKey: 'service_id',
    onDelete: 'CASCADE'
});
ConsultantService.belongsTo(Service, {
    foreignKey: 'service_id'
});

BusinessConsultant.hasMany(ConsultantService, {
    foreignKey: 'consultant_id',
    onDelete: 'CASCADE'
});
ConsultantService.belongsTo(BusinessConsultant, {
    foreignKey: 'consultant_id'
});

// הגדר את הקשרים בין Meeting ל-Service
Meeting.belongsTo(Service, {
    foreignKey: 'service_id'
});

// אם יש צורך להוסיף קשרים נוספים, ניתן להוסיף כאן

module.exports = {
    BusinessConsultant,
    BusinessDetail,
    BusinessHours,
    Client,
    Service,
    Meeting,
    ConsultantService
};