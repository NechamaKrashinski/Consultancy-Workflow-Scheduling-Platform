// const { rows } = require("mssql");
// const { BusinessConsultant, BusinessHours, Meeting } = require("../models/associations.js");
// const { Op } = require('sequelize');

// const getConsultantsByService = async (serviceId) => {
//     if (!serviceId) {
//         throw new Error('Service ID is required');
//     }
//     return await BusinessConsultant.findAll({
//         include: [{
//             model: ConsultantService,
//             where: { service_id: serviceId }
//         }]
//     });
// };
// const getBusinessHoursByConsultants = async (consultantIds) => {
//     // בדיקת תקינות: האם המערך הוא לא ריק
//     if (!Array.isArray(consultantIds) || consultantIds.length === 0) {
//         throw new Error('Invalid input: consultantIds must be a non-empty array.');
//     }

//     // שאילתת מסד נתונים לקבלת זמני פעילות
//     const businessHours = await BusinessHours.findAll({
//         where: {
//             business_consultant_id: {
//                 [Op.in]: consultantIds
//             },
//             date: { [Op.gte]: new Date() },
//             is_active: true 
//         },
//         attributes: ['date', 'start_time', 'end_time'],
//         raw: true // מחזיר תוצאות כאובייקטים פשוטים
//     });

//     // הסרת כפילויות
//     const uniqueBusinessHours = [];
//     const seenDates = new Set();

//     businessHours.forEach(hour => {
//         const dateKey = `${hour.date}-${hour.start_time}-${hour.end_time}`;
//         if (!seenDates.has(dateKey)) {
//             seenDates.add(dateKey);
//             uniqueBusinessHours.push(hour);
//         }
//     });

//     return uniqueBusinessHours;
// };

// const getMeetingsByConsultantsAndDates = async (dates, consultantIds) => {
//     // בדיקת תקינות: האם המערך של תאריכים הוא לא ריק
//     if (!Array.isArray(dates) || dates.length === 0) {
//         throw new Error('Invalid input: dates must be a non-empty array.');
//     }

//     // בדיקת תקינות: האם המערך של מזהי היועצים הוא לא ריק
//     if (!Array.isArray(consultantIds) || consultantIds.length === 0) {
//         throw new Error('Invalid input: consultantIds must be a non-empty array.');
//     }
//     //-------------------------------------
//     const businessHours = await getBusinessHoursByDatesAndConsultants(dates, consultantIds);
//     let meetings = []
//     for (let businessHour in businessHours) {
//         const available_slots = await getMeetingsByBusinessHour(businessHour.id);
//         if(!available_slots){
//             const v = {
//                 'date':businessHour.date,
//                 'start_time':businessHour.start_time,
//                 'end_time':businessHour.end_time,
//                 'name':businessHour.name
//             } 
//             meetings.push(v)
//         }
            
//         else{
//             meetings.push(available_slots)
//         }
        
//     }
//     return meetings.map(slot => ({
//         date: slot.date,
//         start_time: slot.start_time,
//         end_time: slot.end_time,
//         consultant_name:slot.name
//     }));
// };


// module.exports = {
//     getConsultantsByService,
//     getBusinessHoursByConsultants,
//     getAvailableTimes,
//     getMeetingsByConsultantsAndDates
// }



// // מחזירה את שעות העסקים של יועץ ביום מסוים.

// const getBusinessHours = async (businessConsultantId, formattedDate) => {
//     return await BusinessHours.findAll({
//         where: {
//             business_consultant_id: businessConsultantId,
//             date: formattedDate,
//             is_active: true
//         }
//     });
// };


// // מחזירה את הפגישות התפוסות ביום מסוים.

// const getBookedMeetings = async (formattedDate, businessHours) => {
//     return await Meeting.findAll({
//         where: {
//             date: formattedDate,
//             business_hour_id: businessHours.map(hour => hour.id),
//             status: ['booked', 'confirmed']
//         }
//     });
// };


// // מחשבת את השעות הפנויות על בסיס שעות העסקים ושעות הפגישות התפוסות.

// const calculateAvailableTimes = (businessHours, bookedTimes) => {
//     const availableTimes = [];
//     businessHours.forEach(hour => {
//         let currentStart = hour.start_time;

//         bookedTimes.forEach(booked => {
//             if (booked.start >= hour.end_time) return;

//             if (booked.start > currentStart) {
//                 availableTimes.push({
//                     start: currentStart,
//                     end: booked.start
//                 });
//             }

//             currentStart = Math.max(currentStart, booked.end);
//         });

//         if (currentStart < hour.end_time) {
//             availableTimes.push({
//                 start: currentStart,
//                 end: hour.end_time
//             });
//         }
//     });

//     return availableTimes.filter(time => time.start < time.end);
// };


// // הפונקציה הראשית שמקבלת תאריכים וזיהוי יועצים ומחזירה את שעות הפגישות הפנויות לכל יועץ.

// const getAvailableTimes = async (dates, businessConsultantIds) => {
//     if (!dates || !businessConsultantIds || !Array.isArray(dates) || !Array.isArray(businessConsultantIds)) {
//         throw new Error('Invalid input: dates and businessConsultantIds must be non-null arrays');
//     }

//     const availableTimesByConsultant = {};

//     for (const businessConsultantId of businessConsultantIds) {
//         availableTimesByConsultant[businessConsultantId] = {};

//         for (const date of dates) {
//             const formattedDate = new Date(date).toISOString().split('T')[0];
//             const businessHours = await getBusinessHours(businessConsultantId, formattedDate);
//             const bookedMeetings = await getBookedMeetings(formattedDate, businessHours);
//             const bookedTimes = bookedMeetings.map(meeting => ({
//                 start: meeting.start_time,
//                 end: meeting.end_time
//             }));

//             const availableTimes = calculateAvailableTimes(businessHours, bookedTimes);
//             availableTimesByConsultant[businessConsultantId][formattedDate] = availableTimes;
//         }
//     }

//     return availableTimesByConsultant;
// };
