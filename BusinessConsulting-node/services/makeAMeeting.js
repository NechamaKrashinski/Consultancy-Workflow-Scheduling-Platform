const express = require('express');
const {ConsultantService} = require('../models/associations.js');
const {BusinessConsultant} = require('../models/associations.js');
const {BusinessHours} = require('../models/associations.js');

const { Op } = require('sequelize');

//החזרת יועצים לפי שירות
const getConsultantsByService = async (serviceId) => {
    if (!serviceId) {
        throw new Error('Service ID is required');
    }
    return await BusinessConsultant.findAll({
        include: [{
            model: ConsultantService,
            where: { service_id: serviceId }
        }]
    });
};

// פונקציה לקבלת זמני פעילות לפי מזהי יועצים
// מקבלת מערך של מזהי יועצים ומחזירה את זמני הפעילות
const getBusinessHoursByConsultants = async (consultantIds) => {
    // בדיקת תקינות: האם המערך הוא לא ריק
    if (!Array.isArray(consultantIds) || consultantIds.length === 0) {
        throw new Error('Invalid input: consultantIds must be a non-empty array.');
    }

    // שאילתת מסד נתונים לקבלת זמני פעילות
    const businessHours = await BusinessHours.findAll({
        where: {
            business_consultant_id: {
                [Op.in]: consultantIds
            },
            date: { [Op.gte]: new Date() }, // רק תאריכים מהעבר
            is_active: true // רק זמני פעילות פעילים
        },
        attributes: ['date', 'start_time', 'end_time'],
        raw: true // מחזיר תוצאות כאובייקטים פשוטים
    });

    // הסרת כפילויות
    const uniqueBusinessHours = [];
    const seenDates = new Set();

    businessHours.forEach(hour => {
        const dateKey = `${hour.date}-${hour.start_time}-${hour.end_time}`;
        if (!seenDates.has(dateKey)) {
            seenDates.add(dateKey);
            uniqueBusinessHours.push(hour);
        }
    });

    return uniqueBusinessHours;
};



module.exports = { getConsultantsByService,getBusinessHoursByConsultants };
