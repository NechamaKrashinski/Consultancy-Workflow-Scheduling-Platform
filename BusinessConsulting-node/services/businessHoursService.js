const {BusinessHours,Consultant,Meeting} = require('../models/associations.js'); // נתיב המודל של שעות העבודה
const { Op } = require('sequelize');

// פונקציה להוסיף שעות עבודה ליועץ
const addBusinessHours = async (businessHoursData) => {
    // בדיקות תקינות
    const { consultantId, startTime, endTime, date } = businessHoursData;

    // בדוק אם כל הפרמטרים קיימים
    if (!consultantId || !startTime || !endTime || !date) {
        throw new Error('Missing required fields: consultantId, startTime, endTime, date');
    }

    // בדוק אם השעות תקינות
    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error('Start time must be before end time');
    }

    // בדוק אם היועץ קיים במערכת
    const consultantExists = await Consultant.findById(consultantId);
    if (!consultantExists) {
        throw new Error('Consultant does not exist');
    }

    // קבל את כל שעות העבודה הקיימות ליועץ בתאריך הנתון
    const existingHours = await BusinessHours.findAll({
        where: {
            business_consultant_id: consultantId,
            date: date
        }
    });
    // בדוק אם יש חפיפות בשעות
    for (const hour of existingHours) {
        if (
            (new Date(startTime) < new Date(hour.endTime) && new Date(endTime) > new Date(hour.startTime))
        ) {
            throw new Error('Business hours overlap with existing hours for this consultant on the specified date');
        }
    }

    
   
        const businessHours = await BusinessHours.create(businessHoursData);
        return businessHours;
  
};

const getBusinessHoursByConsultant = async (consultantId) => {
    if (!consultantId) {
        throw new Error('Consultant ID is required');
    }
    const businessHours = await BusinessHours.findAll({
        where: { business_consultant_id: consultantId },
        order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    return businessHours;

};

const getAllBusinessHours = async()=>{
    const businessHours = await BusinessHours.findAll();
    return businessHours;
}


const updateBusinessHours = async (businessConsultantId, date, newStartTime, newEndTime) => {
    // 1. בדוק אם היועץ קיים
    const businessConsultant = await BusinessConsultant.findByPk(businessConsultantId);
    if (!businessConsultant) {
        throw new Error('Business consultant not found');
    }

    // 2. בדוק אם התאריך הוא בעתיד
    if (date < new Date().toISOString().split('T')[0]) {
        throw new Error('Date must be in the future');
    }

    // 3. בדוק אם היום הוא יום עבודה
    const businessHours = await BusinessHours.findAll({
        where: {
            business_consultant_id: businessConsultantId,
            date: date
        }
    });

    if (businessHours.length === 0) {
        throw new Error('No business hours found for this day');
    }

    // 4. בדוק אם השעת פעילות קיימת
    const existingHours = businessHours.find(hour => 
        hour.start_time <= newStartTime && hour.end_time >= newEndTime
    );

    if (!existingHours) {
        throw new Error('The specified time range is not within existing business hours');
    }

    // 5. חישוב חלקי השעות
    const timeSlots = calculateTimeSlots(existingHours, newStartTime, newEndTime);

    // 6. עדכון שעות הפעילות בטבלה
    await updateBusinessHoursInDB(existingHours, timeSlots, businessConsultantId, date);

    // 7. עדכון פגישות חופפות
    await updateOverlappingAppointments(existingHours, timeSlots);
};

// פונקציה לחישוב חלקי השעות
const calculateTimeSlots = (existingHours, newStartTime, newEndTime) => {
    const timeSlots = [];
    const startHour = existingHours.start_time;
    const endHour = existingHours.end_time;

    // מצב 1: חיתוך לשלושה חלקים
    if (startHour < newStartTime && newEndTime < endHour) {
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true }); // חלק ראשון
        timeSlots.push({ start_time: newStartTime, end_time: newEndTime, status: false }); // חלק שני (בוטל)
        timeSlots.push({ start_time: newEndTime, end_time: endHour, status: true }); // חלק שלישי
    } 
    // מצב 2: חיתוך לשניים
    else if (startHour < newStartTime && newEndTime >= endHour) {
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true }); // חלק ראשון
        timeSlots.push({ start_time: newStartTime, end_time: endHour, status: false }); // חלק שני (בוטל)
    } 
    else if (newStartTime <= startHour && newEndTime < endHour) {
        timeSlots.push({ start_time: newStartTime, end_time: endHour, status: false }); // חלק בוטל
        timeSlots.push({ start_time: startHour, end_time: newStartTime, status: true }); // חלק פעיל
    }

    return timeSlots;
};

// פונקציה לעדכון שעות הפעילות בטבלה
const updateBusinessHoursInDB = async (existingHours, timeSlots, businessConsultantId, date) => {
    await existingHours.destroy(); // מחק את השעה המקורית

    let beforeHour, cancelHour, afterHour;
    for (const slot of timeSlots) {
        const newHour = await BusinessHours.create({
            business_consultant_id: businessConsultantId,
            date: date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: slot.status
        });
        if (!slot.status) {
            cancelHour = newHour;
        } else if (beforeHour || cancelHour) {
            afterHour = newHour;
        } else {
            beforeHour = newHour;
        }
    }

    return { beforeHour, cancelHour, afterHour };
};

// פונקציה לעדכון פגישות חופפות
const updateOverlappingAppointments = async (existingHours, timeSlots) => {
    const overlappingSlots = await Meeting.findAll({
        where: {
            business_hour_id: existingHours.id,
            [Op.or]: [
                { start_time: { [Op.lt]: newEndTime }, end_time: { [Op.gt]: newStartTime } }
            ]
        }
    });

    for (const slot of overlappingSlots) {
        await slot.update({ status: 'canceled' });
    }

    const overlapping = await Meeting.findAll({
        where: {
            business_hour_id: existingHours.id,
        }
    });

    for (const slot of overlapping) {
        if (slot.start_time < newEndTime) {
            await slot.update({ business_hour_id: beforeHour.id });
        } else if (slot.end_time > newStartTime) {
            await slot.update({ business_hour_id: afterHour.id });
        }
    }
};

module.exports = {
    addBusinessHours,
    getAllBusinessHours,
    getBusinessHoursByConsultant,
    updateBusinessHours
};
