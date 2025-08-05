const { BusinessHours } = require('../models/businessHoursModel.js');
const { BusinessConsultant } = require('../models/associations.js');
const { Op } = require('sequelize');

// פונקציה לבדוק אם כל השדות הנדרשים קיימים ותקינים
const validateBusinessHoursInput = ({ business_consultant_id, date, start_time, end_time }) => {
    if (!business_consultant_id || !date || !start_time || !end_time) {
        throw new Error('All fields are required');
    }

    const today = new Date();
    if (new Date(date) < today) {
        throw new Error('Date must be in the future');
    }

    if (start_time >= end_time) {
        throw new Error('Start time must be less than end time');
    }
};

// פונקציה לבדוק אם היועץ קיים
const checkConsultantExists = async (business_consultant_id) => {
    const consultantExists = await BusinessConsultant.findByPk(business_consultant_id);
    if (!consultantExists) {
        throw new Error('Consultant does not exist');
    }
};

// פונקציה לבדוק אם יש שעות חופפות
const checkForOverlappingHours = async (business_consultant_id, date, start_time, end_time) => {
    const existingHours = await BusinessHours.findAll({
        where: {
            business_consultant_id,
            date
        }
    });

    for (const hours of existingHours) {
        if ((start_time < hours.end_time && end_time > hours.start_time)) {
            return hours;
        }
    }

    return null;
};

// פונקציה להרחיב שעות פעילות קיימות
const extendBusinessHours = async (hours, start_time, end_time) => {
    const newStartTime = Math.min(hours.start_time, start_time);
    const newEndTime = Math.max(hours.end_time, end_time);

    await BusinessHours.update(
        { start_time: newStartTime, end_time: newEndTime },
        { where: { id: hours.id } }
    );

    return {
        message: `The hours have been extended to ${newStartTime} - ${newEndTime}`
    };
};

// פונקציה להוסיף שעות פעילות חדשות
const addNewBusinessHours = async ({ business_consultant_id, date, start_time, end_time }) => {
    return await BusinessHours.create({
        business_consultant_id,
        date,
        start_time,
        end_time
    });
};

// פונקציה להוסיף שעות פעילות, כולל בדיקות תקינות
const addBusinessHours = async (input) => {
    validateBusinessHoursInput(input);
    await checkConsultantExists(input.business_consultant_id);

    const { business_consultant_id, date, start_time, end_time } = input;
    const existingHours = await checkForOverlappingHours(business_consultant_id, date, start_time, end_time);

    if (existingHours) {
        return await extendBusinessHours(existingHours, start_time, end_time);
    }

    return await addNewBusinessHours(input);
};

// פונקציה לקבלת שעות פעילות לפי מזהה יועץ
const getBusinessHoursByConsultant = async (consultantId) => {
    if (!consultantId) {
        throw new Error('Consultant ID is required');
    }

    return await BusinessHours.findAll({
        where: {
            business_consultant_id: consultantId
        }
    });
};

// פונקציה לעדכון שעות פעילות
const updateBusinessHours = async (businessConsultantId, date, newStartTime, newEndTime) => {
    await checkConsultantExists(businessConsultantId);
    
    if (date < new Date().toISOString().split('T')[0]) {
        throw new Error('Date must be in the future');
    }

    const businessHours = await BusinessHours.findAll({
        where: {
            business_consultant_id: businessConsultantId,
            date: date
        }
    });

    if (businessHours.length === 0) {
        throw new Error('No business hours found for this day');
    }

    const existingHours = businessHours.find(hour => 
        hour.start_time <= newStartTime && hour.end_time >= newEndTime
    );

    if (!existingHours) {
        throw new Error('The specified time range is not within existing business hours');
    }

    const timeSlots = calculateTimeSlots(existingHours.start_time, existingHours.end_time, newStartTime, newEndTime);
    await existingHours.destroy();
    
    const { beforeHour, cancelHour, afterHour } = await createNewBusinessHours(businessConsultantId, date, timeSlots);
    await updateOverlappingTimeSlots(existingHours.id, newStartTime, newEndTime, beforeHour, afterHour, cancelHour);
};

// פונקציה לחישוב חלקי השעות
const calculateTimeSlots = (startHour, endHour, newStartTime, newEndTime) => {
    const timeSlots = [];
    
    if (startHour < newStartTime && newEndTime < endHour) {
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true });
        timeSlots.push({ start_time: newStartTime, end_time: newEndTime, status: false });
        timeSlots.push({ start_time: newEndTime, end_time: endHour, status: true });
    } else if (startHour < newStartTime && newEndTime >= endHour) {
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true });
        timeSlots.push({ start_time: newStartTime, end_time: endHour, status: false });
    } else if (newStartTime <= startHour && newEndTime < endHour) {
        timeSlots.push({ start_time: newStartTime, end_time: endHour, status: false });
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true });
    }

    return timeSlots;
};

// פונקציה ליצור שעות פעילות חדשות
const createNewBusinessHours = async (businessConsultantId, date, timeSlots) => {
    const beforeHour = [];
    const cancelHour = [];
    const afterHour = [];

    for (const slot of timeSlots) {
        const newHour = await BusinessHours.create({
            business_consultant_id: businessConsultantId,
            date: date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: slot.status
        });

        if (!slot.status) {
            cancelHour.push(newHour);
        } else if (beforeHour.length !== 0 || cancelHour.length !== 0) {
            afterHour.push(newHour);
        } else {
            beforeHour.push(newHour);
        }
    }

    return { beforeHour, cancelHour, afterHour };
};

// פונקציה לעדכון פגישות חופפות
const updateOverlappingTimeSlots = async (existingHourId, newStartTime, newEndTime, beforeHour, afterHour, cancelHour) => {
    const overlappingSlots = await Meeting.findAll({
        where: {
            business_hour_id: existingHourId,
            [Op.or]: [
                { start_time: { [Op.lt]: newEndTime }, end_time: { [Op.gt]: newStartTime } }
            ]
        }
    });

    for (const slot of overlappingSlots) {
        await slot.update({ status: 'canceled', business_hour_id: cancelHour[0].id });
    }

    const overlapping = await Meeting.findAll({
        where: {
            business_hour_id: existingHourId,
        }
    });

    for (const slot of overlapping) {
        if (slot.start_time < newEndTime) {
            await slot.update({ business_hour_id: beforeHour[0].id });
        } else if (slot.end_time > newStartTime) {
            await slot.update({ business_hour_id: afterHour[0].id });
        }
    }
};



module.exports = {
    addBusinessHours,
    getBusinessHoursByConsultant,
    updateBusinessHours
};