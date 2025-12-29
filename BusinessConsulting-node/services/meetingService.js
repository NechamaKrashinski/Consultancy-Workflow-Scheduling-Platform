const { Meeting, Service, Client, BusinessHours, BusinessConsultant, ConsultantService } = require('../models/associations.js');
const { Sequelize, Op } = require('sequelize');
const { sendMeetingConfirmation, sendConsultantNotification } = require('./emailService');

// ------------------------
// פונקציות ניהול פגישות
// ------------------------
// ------------------------
// פונקציות עזר מתוקנות לזמנים
// ------------------------

const getBusinessHours = async (businessConsultantId, dateString) => {
    // יצירת טווח זמנים ליום השלם (מ-00:00 ועד סוף היום) כדי למנוע בעיות אזורי זמן
    // אנו מניחים ש-dateString מגיע בפורמט YYYY-MM-DD
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);
    
    // במקרה של בעיות UTC, נוסיף יום אחד קדימה לגבול העליון כדי לתפוס הכל
    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log(`Searching hours for consultant ${businessConsultantId} between ${startOfDay.toISOString()} and ${nextDay.toISOString()}`);

    const hours = await BusinessHours.findAll({
        where: { 
            business_consultant_id: businessConsultantId, 
            is_active: true,
            // חיפוש בטווח במקום התאמה מדויקת
            date: {
                [Op.gte]: startOfDay,
                [Op.lt]: nextDay
            }
        }
    });

    return hours.map(h => ({
        id: h.id,
        business_consultant_id: h.business_consultant_id,
        date: h.date,
        // טיפול בשעות שחוזרות כאובייקט Date
        start_time: h.start_time instanceof Date ? h.start_time.toISOString().substr(11, 8) : h.start_time,
        end_time: h.end_time instanceof Date ? h.end_time.toISOString().substr(11, 8) : h.end_time,
        is_active: h.is_active
    }));
};

const getAvailableTimes = async (dates, businessConsultantIds, serviceId) => {
    if (!dates || !businessConsultantIds || !Array.isArray(dates) || !Array.isArray(businessConsultantIds)) {
        throw new Error('Invalid input: dates and businessConsultantIds must be non-null arrays');
    }
    if (!serviceId) throw new Error('serviceId is required');

    let serviceDuration = 30;
    const service = await Service.findByPk(serviceId);
    if (service) serviceDuration = service.duration;

    const result = {};
    for (const consultantId of businessConsultantIds) {
        result[consultantId] = {};
        for (const date of dates) {
            // תיקון קריטי: שימוש בתאריך כפי שהוא (String) בלי להמיר ל-ISO שישנה את היום
            // הלקוח כבר שולח לנו YYYY-MM-DD נקי
            const dateString = date; 
            
            const hours = await getBusinessHours(consultantId, dateString);
            
            // אם לא נמצאו שעות עבודה, מדלגים
            if (!hours || hours.length === 0) {
                result[consultantId][dateString] = [];
                continue;
            }

            const booked = await getBookedMeetings(dateString, hours); // גם כאן נצטרך אולי להתאים את getBookedMeetings אם היא מסתמכת על שוויון מדויק
            result[consultantId][dateString] = calculateAvailableTimes(hours, booked, serviceDuration);
        }
    }
    return result;
};

const createMeeting = async (businessHourId, serviceId, clientId, date, startTime, endTime, notes = '') => {
    if (!businessHourId || !date || !startTime || !endTime || !serviceId || !clientId) {
        throw new Error('All parameters are required.');
    }

    const service = await Service.findByPk(serviceId);
    if (!service) throw new Error('Service does not exist.');

    const client = await Client.findByPk(clientId);
    if (!client) throw new Error('Client does not exist.');

    const businessHour = await BusinessHours.findByPk(businessHourId);
    if (!businessHour) throw new Error('Business Hour not found.');

    const consultant = await BusinessConsultant.findByPk(businessHour.business_consultant_id);
    if (!consultant) throw new Error('Business Consultant not found.');

    // אחידות פורמט זמנים
    const normalizeTime = t => t.includes(':') && t.split(':').length === 2 ? `${t}:00` : t;
    const startTimeString = normalizeTime(startTime);
    const endTimeString = normalizeTime(endTime);
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // בדיקה ל-duplicates
    const existingMeeting = await Meeting.findOne({
        where: {
            business_hour_id: businessHourId,
            date: formattedDate,
            start_time: startTimeString,
            end_time: endTimeString,
            status: { [Op.in]: ['booked', 'confirmed'] }
        }
    });
    if (existingMeeting) throw new Error('A meeting already exists at this exact time slot.');

    // בדיקת חפיפות
    const overlappingMeetings = await Meeting.findAll({
        where: {
            business_hour_id: businessHourId,
            date: formattedDate,
            status: { [Op.in]: ['booked', 'confirmed'] },
            [Op.or]: [
                { start_time: { [Op.lte]: startTimeString }, end_time: { [Op.gt]: startTimeString } },
                { start_time: { [Op.lt]: endTimeString }, end_time: { [Op.gte]: endTimeString } },
                { start_time: { [Op.gte]: startTimeString }, end_time: { [Op.lte]: endTimeString } }
            ]
        }
    });
    if (overlappingMeetings.length > 0) {
        throw new Error(`This time slot conflicts with an existing meeting. Found ${overlappingMeetings.length} conflicting meeting(s).`);
    }

    // יצירת הפגישה
    const meeting = await Meeting.create({
        business_hour_id: businessHourId,
        client_id: clientId,
        service_id: serviceId,
        date: formattedDate,
        start_time: startTimeString,
        end_time: endTimeString,
        status: 'confirmed',
        notes
    });

    // שליחת מיילים אסינכרוני
    const meetingDetails = {
        clientName: client.name,
        consultantName: consultant.name,
        serviceName: service.name,
        date: formattedDate,
        startTime: startTimeString,
        endTime: endTimeString,
        notes,
        clientPhone: client.phone
    };

    sendMeetingConfirmation(client.email, meetingDetails).then(r => r.success ? console.log('Email sent to client') : console.error('Email error:', r.error));
    sendConsultantNotification(consultant.email, meetingDetails).then(r => r.success ? console.log('Notification sent to consultant') : console.error('Notification error:', r.error));

    return meeting;
};

// ------------------------
// פונקציות נוספות
// ------------------------
const updateMeeting = async (id, meetingData) => {
    await Meeting.update(meetingData, { where: { id } });
    return await Meeting.findByPk(id, {
        include: [
            { model: Service, attributes: ['name', 'price', 'duration'] },
            { model: Client, attributes: ['name', 'email'] },
            {
                model: BusinessHours,
                attributes: ['business_consultant_id'],
                include: [{ model: BusinessConsultant, attributes: ['id', 'name', 'email'] }]
            }
        ]
    });
};

const deleteMeeting = async (id) => await Meeting.destroy({ where: { id } });

const getMeetings = async (clientId = null) => {
    const whereClause = clientId ? { client_id: clientId } : {};
    return await Meeting.findAll({
        where: whereClause,
        include: [
            { model: Service, attributes: ['name', 'price', 'duration'] },
            { model: Client, attributes: ['name', 'email'] },
            {
                model: BusinessHours,
                attributes: ['business_consultant_id'],
                include: [{ model: BusinessConsultant, attributes: ['id', 'name', 'email'] }]
            }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
};

const getConsultantsByService = async (serviceId) => {
    if (!serviceId) throw new Error('Service ID is required');
    return await BusinessConsultant.findAll({
        include: [{ model: ConsultantService, where: { service_id: serviceId } }]
    });
};





// ------------------------
// חישוב זמני פגישות פנויים
// ------------------------
const calculateAvailableTimes = (businessHours, bookedTimes, serviceDurationMinutes = 30) => {
    const availableTimes = [];

    const timeToMinutes = t => {
        if (t instanceof Date) return t.getUTCHours() * 60 + t.getUTCMinutes();
        const [h, m] = t.split(':').map(Number); return h * 60 + m;
    };
    const minutesToTime = m => `${Math.floor(m / 60).toString().padStart(2,'0')}:${(m % 60).toString().padStart(2,'0')}`;

    businessHours.forEach(hour => {
        const startMinutes = timeToMinutes(hour.start_time);
        const endMinutes = timeToMinutes(hour.end_time);

        const occupied = bookedTimes
            .map(b => ({ start: Math.max(startMinutes, timeToMinutes(b.start)), end: Math.min(endMinutes, timeToMinutes(b.end)) }))
            .filter(b => b.start < b.end)
            .sort((a,b)=>a.start-b.start);

        let current = startMinutes;
        for (const o of occupied) {
            while (current + serviceDurationMinutes <= o.start) {
                availableTimes.push({ start: minutesToTime(current), end: minutesToTime(current + serviceDurationMinutes), businessHourId: hour.id });
                current += serviceDurationMinutes;
            }
            current = Math.max(current, o.end);
        }
        while (current + serviceDurationMinutes <= endMinutes) {
            availableTimes.push({ start: minutesToTime(current), end: minutesToTime(current + serviceDurationMinutes), businessHourId: hour.id });
            current += serviceDurationMinutes;
        }
    });

    return availableTimes;
};


const getBookedMeetings = async (dateString, businessHours) => {
    const booked = [];
    
    // יצירת טווח זמנים גם כאן
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    for (const hour of businessHours) {
        const meetings = await Meeting.findAll({
            where: {
                business_hour_id: hour.id,
                // גם כאן, נחפש בטווח
                date: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: nextDay
                },
                status: { [Op.in]: ['booked', 'confirmed'] }
            }
        });
        meetings.forEach(m => booked.push({ start: m.start_time, end: m.end_time }));
    }
    return booked;
};

module.exports = {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetings,
    getAvailableTimes,
    getConsultantsByService
};
