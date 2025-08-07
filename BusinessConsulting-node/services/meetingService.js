const { Meeting, Service, Client, BusinessHours, BusinessConsultant, ConsultantService } = require('../models/associations.js');
const { Sequelize, Op } = require('sequelize');
const { sendMeetingConfirmation, sendConsultantNotification } = require('./emailService');

// פונקציות ניהול פגישות
const createMeeting = async (businessHourId, serviceId, clientId, date, startTime, endTime, notes = '') => {
    // 1. בדיקות תקינות של הפרמטרים
    if (!businessHourId || !date || !startTime || !endTime || !serviceId || !clientId) {
        throw new Error('All parameters are required.');
    }

    // 2. בדוק אם השירות קיים
    const serviceExists = await Service.findByPk(serviceId);
    if (!serviceExists) {
        throw new Error('Service does not exist.');
    }
    
    const client = await Client.findByPk(clientId);
    if (!client) {
        throw new Error('Client does not exist.');
    }
    // 3. בדיקה האם שעת הפעילות קיימת
    const businessHour = await BusinessHours.findOne({
        where: { id: businessHourId },
    });

    if (!businessHour) {
        throw new Error('Business Hour not found.');
    }
    
    const { start_time: businessStartTime, end_time: businessEndTime } = businessHour;
    const consultantId = businessHour.business_consultant_id; // הנחה שהיועץ שמור בטבלה זו

    // 4. בדיקה אם היועץ קיים 
    const businessConsultant = await BusinessConsultant.findOne({
        where: { id: consultantId },
    });

    if (!businessConsultant) {
        throw new Error('Business Consultant not found.');
    }
    
    // 5. המרת זמנים ותאריכים לפורמט אחיד לבדיקה ושמירה
    const normalizeTimeString = (timeStr) => {
        // בדיקה אם יש שניות, אם לא - הוסף אותן
        if (timeStr.includes(':') && timeStr.split(':').length === 2) {
            return `${timeStr}:00`;
        }
        return timeStr;
    };

    const parseTimeForComparison = (timeStr) => {
        // ליצור Date object רק לצורך השוואה
        if (timeStr instanceof Date) return timeStr;
        const normalizedTime = normalizeTimeString(timeStr);
        return new Date(`1970-01-01T${normalizedTime}.000Z`);
    };
    
    const parseDate = (dateStr) => {
        if (dateStr instanceof Date) return dateStr;
        return new Date(dateStr);
    };
    
    // המרת זמנים לפורמטים שונים
    const startTimeString = normalizeTimeString(startTime);
    const endTimeString = normalizeTimeString(endTime);
    const startTimeForComparison = parseTimeForComparison(startTime);
    const endTimeForComparison = parseTimeForComparison(endTime);
    const meetingDate = parseDate(date);
    
    // 6. בדיקה ישירה במסד נתונים - הגנה נגד duplicates
    const existingMeeting = await Meeting.findOne({
        where: {
            business_hour_id: businessHourId,
            date: meetingDate,
            start_time: startTimeString,  // השוואה עם string
            end_time: endTimeString,      // השוואה עם string
            status: ['booked', 'confirmed']
        }
    });

    if (existingMeeting) {
        throw new Error('A meeting already exists at this exact time slot.');
    }

    // 7. בדיקה נוספת לחפיפות זמן - לוגיקה מתוקנת עם strings
    const overlappingMeetings = await Meeting.findAll({
        where: {
            business_hour_id: businessHourId,
            date: meetingDate,
            status: ['booked', 'confirmed'],
            [Op.or]: [
                {
                    // מקרה 1: הפגישה הקיימת מתחילה לפני או בזמן תחילת הפגישה החדשה
                    // ומסתיימת אחרי תחילת הפגישה החדשה
                    start_time: { [Op.lte]: startTimeString },
                    end_time: { [Op.gt]: startTimeString }
                },
                {
                    // מקרה 2: הפגישה הקיימת מתחילה לפני סיום הפגישה החדשה
                    // ומסתיימת אחרי או בזמן סיום הפגישה החדשה
                    start_time: { [Op.lt]: endTimeString },
                    end_time: { [Op.gte]: endTimeString }
                },
                {
                    // מקרה 3: הפגישה הקיימת מתחילה אחרי תחילת הפגישה החדשה
                    // ומסתיימת לפני סיום הפגישה החדשה (הפגישה החדשה מכסה את הקיימת)
                    start_time: { [Op.gte]: startTimeString },
                    end_time: { [Op.lte]: endTimeString }
                }
            ]
        }
    });

    if (overlappingMeetings.length > 0) {
        throw new Error(`This time slot conflicts with an existing meeting. Found ${overlappingMeetings.length} conflicting meeting(s).`);
    }

    // 8. יצירת הפגישה
    const meeting = await Meeting.create({
        business_hour_id: businessHourId,
        client_id: clientId,
        service_id: serviceId,
        date: meetingDate,
        start_time: startTimeString,  // שמירה כ-string
        end_time: endTimeString,      // שמירה כ-string
        status: 'confirmed',  // אישור מיידי - היועץ יכול לבטל/לשנות תוך 24 שעות
        notes: notes,
    });

    // 9. שליחת מיילים (ללא חסימה - אסינכרוני)
    try {
        // הכנת פרטי הפגישה למייל
        const meetingDetails = {
            clientName: client.name,
            consultantName: businessConsultant.name,
            serviceName: serviceExists.name,
            date: meetingDate.toLocaleDateString('he-IL'),
            startTime: startTimeString,
            endTime: endTimeString,
            notes: notes,
            clientPhone: client.phone
        };

        // שליחת מייל אישור ללקוח (ללא await - לא רוצים לחכות)
        sendMeetingConfirmation(client.email, meetingDetails)
            .then(result => {
                if (result.success) {
                    console.log('✅ Email confirmation sent to client:', client.email);
                } else {
                    console.error('❌ Failed to send email to client:', result.error);
                }
            });

        // שליחת מייל התראה ליועץ (ללא await - לא רוצים לחכות)
        sendConsultantNotification(businessConsultant.email, meetingDetails)
            .then(result => {
                if (result.success) {
                    console.log('✅ Notification sent to consultant:', businessConsultant.email);
                } else {
                    console.error('❌ Failed to send notification to consultant:', result.error);
                }
            });

    } catch (emailError) {
        // אם יש שגיאה במייל - לא נכשיל את יצירת הפגישה
        console.error('⚠️ Email service error (meeting still created):', emailError);
    }

    return meeting; // מחזיר את הפגישה שנוצרה
};

const updateMeeting = async (id, meetingData) => {
    await Meeting.update(meetingData, { where: { id } });
    
    // החזרת הפגישה המעודכנת עם כל הקשרים
    return await Meeting.findByPk(id, {
        include: [
            {
                model: Service,
                attributes: ['name', 'price', 'duration']
            },
            {
                model: Client,
                attributes: ['name', 'email']
            },
            {
                model: BusinessHours,
                attributes: ['business_consultant_id'],
                include: [
                    {
                        model: BusinessConsultant,
                        attributes: ['id', 'name', 'email']
                    }
                ]
            }
        ]
    });
};

const deleteMeeting = async (id) => {
    await Meeting.destroy({ where: { id } });
};

const getMeetings = async (clientId = null) => {
    const whereClause = clientId ? { client_id: clientId } : {};
    
    return await Meeting.findAll({
        where: whereClause,
        include: [
            {
                model: Service,
                attributes: ['name', 'price', 'duration']
            },
            {
                model: Client,
                attributes: ['name', 'email']
            },
            {
                model: BusinessHours,
                attributes: ['business_consultant_id'],
                include: [
                    {
                        model: BusinessConsultant,
                        attributes: ['id', 'name', 'email']
                    }
                ]
            }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
};

// פונקציות לקבלת יועצים לפי שירות
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


const getBusinessHours = async (businessConsultantId, formattedDate) => {
    let formattedBusinessHours = [];
    try {
        const businessHours = await BusinessHours.findAll({
            where: {
                business_consultant_id: businessConsultantId,
                date: formattedDate,
                is_active: true
            }
        });

        // המרה של start_time ו-end_time לאחר קבלת התוצאות
        formattedBusinessHours = businessHours.map(hour => ({
            id: hour.id,
            business_consultant_id: hour.business_consultant_id,
            date: hour.date,
            start_time: hour.start_time.toISOString().substr(11, 8), // חיתוך השעה
            end_time: hour.end_time.toISOString().substr(11, 8), // חיתוך השעה
            is_active: hour.is_active
        }));
    } catch (error) {
        console.error('Error fetching business hours:', error);
    }

    return formattedBusinessHours; // החזר את המערך המפורמט
};


const getBookedMeetings = async (formattedDate, businessHours) => {
    // פונקציה להמרת זמן מ-string ל-minutes מתחילת היום    return bookedMeetings;
};

// const calculateAvailableTimes = (businessHours, bookedTimes) => {
//     const availableTimes = [];
//     console.log("Calculating available times based on business hours and booked times");
//     log("Business hours:", businessHours);
//     log("Booked times:", bookedTimes);
//     businessHours.forEach(hour => {
//         let currentStart = hour.start_time;
//         console.log(`Processing business hour: ${hour.start_time} to ${hour.end_time}`);
//         bookedTimes.forEach(booked => {
//             if (booked.start >= hour.end_time) break;

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

const calculateAvailableTimes = (businessHours, bookedTimes, serviceDurationMinutes = 30) => {
    const availableTimes = [];
  
    // פונקציה להמרת זמן מ-string ל-minutes מתחילת היום
    const timeToMinutes = (timeString) => {
        // אם זה Date object, נוציא רק את החלק של השעה
        if (timeString instanceof Date) {
            const hours = timeString.getUTCHours();
            const minutes = timeString.getUTCMinutes();
            return hours * 60 + minutes;
        }
        // אם זה string, נפרק כרגיל
        const timeStr = timeString.toString().split('T')[1] || timeString.toString();
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    
    // פונקציה להמרת minutes בחזרה ל-string
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    businessHours.forEach(hour => {
        const startMinutes = timeToMinutes(hour.start_time);
        const endMinutes = timeToMinutes(hour.end_time);
        
        console.log(`🔍 Processing business hour: ${hour.start_time} to ${hour.end_time} (${startMinutes}-${endMinutes} minutes)`);
        
        // יצירת רשימה של כל הזמנים התפוסים באותה שעת עבודה
        const occupiedSlots = [];
        bookedTimes.forEach(booked => {
            const bookedStart = timeToMinutes(booked.start);
            const bookedEnd = timeToMinutes(booked.end);
            
            console.log(`🚫 Checking booked slot: ${booked.start} to ${booked.end} (${bookedStart}-${bookedEnd} minutes)`);
            
            // אם הפגישה התפוסה נמצאת בטווח שעות העבודה
            if (bookedStart < endMinutes && bookedEnd > startMinutes) {
                occupiedSlots.push({
                    start: Math.max(bookedStart, startMinutes),
                    end: Math.min(bookedEnd, endMinutes)
                });
                console.log(`❌ Added occupied slot: ${Math.max(bookedStart, startMinutes)}-${Math.min(bookedEnd, endMinutes)}`);
            }
        });
        
        // מיון הזמנים התפוסים
        occupiedSlots.sort((a, b) => a.start - b.start);
        console.log(`📋 Sorted occupied slots:`, occupiedSlots);
        
        // יצירת זמנים פנויים
        let currentMinutes = startMinutes;
        
        for (const occupied of occupiedSlots) {
            // יצירת slots פנויים לפני הזמן התפוס
            while (currentMinutes + serviceDurationMinutes <= occupied.start) {
                availableTimes.push({
                    start: minutesToTime(currentMinutes),
                    end: minutesToTime(currentMinutes + serviceDurationMinutes),
                    businessHourId: hour.id
                });
                console.log(`✅ Available slot: ${minutesToTime(currentMinutes)} - ${minutesToTime(currentMinutes + serviceDurationMinutes)}`);
                currentMinutes += serviceDurationMinutes;
            }
            currentMinutes = Math.max(currentMinutes, occupied.end);
        }
        
        // יצירת slots פנויים אחרי כל הזמנים התפוסים
        while (currentMinutes + serviceDurationMinutes <= endMinutes) {
            availableTimes.push({
                start: minutesToTime(currentMinutes),
                end: minutesToTime(currentMinutes + serviceDurationMinutes),
                businessHourId: hour.id
            });
            console.log(`✅ Available slot after occupied: ${minutesToTime(currentMinutes)} - ${minutesToTime(currentMinutes + serviceDurationMinutes)}`);
            currentMinutes += serviceDurationMinutes;
        }
    });

    console.log("🎯 Final available time slots:", availableTimes);
    return availableTimes;
};


const getAvailableTimes = async (dates, businessConsultantIds, serviceId) => {
    console.log("Getting available times for dates:", dates, "and businessConsultantIds:", businessConsultantIds, "serviceId:", serviceId);
    
    if (!dates || !businessConsultantIds || !Array.isArray(dates) || !Array.isArray(businessConsultantIds)) {
        throw new Error('Invalid input: dates and businessConsultantIds must be non-null arrays');
    }

    // קבלת פרטי השירות כדי לדעת את משך הזמן
    let serviceDuration = 30; // ברירת מחדל 30 דקות
    if (serviceId) {
        const service = await Service.findByPk(serviceId);
        if (service) {
            serviceDuration = service.duration;
            console.log("Service duration:", serviceDuration, "minutes");
        }
    }

    const availableTimesByConsultant = {};

    for (const businessConsultantId of businessConsultantIds) {
        availableTimesByConsultant[businessConsultantId] = {};

        for (const date of dates) {
            const dateObject = new Date(date);
            const formattedDate = dateObject.toISOString().split('T')[0];
            console.log(`Processing date: ${formattedDate} for consultant ID: ${businessConsultantId} type of date: ${typeof formattedDate}`);
            const businessHours = await getBusinessHours(businessConsultantId, dateObject);
            console.log(`Business hours for ${formattedDate}:`, businessHours);
            const bookedMeetings = await getBookedMeetings(dateObject, businessHours);
            console.log(`Booked meetings for ${formattedDate}:`, bookedMeetings);
            const bookedTimes = bookedMeetings.map(meeting => ({
                start: meeting.start_time,
                end: meeting.end_time
            }));
            console.log(`Booked times for ${formattedDate}:`, bookedTimes);
            const availableTimes = calculateAvailableTimes(businessHours, bookedTimes, serviceDuration);
            console.log(`Available times for ${formattedDate}:`, availableTimes);
            availableTimesByConsultant[businessConsultantId][formattedDate] = availableTimes;

        }
    }

    return availableTimesByConsultant;
};




module.exports = {
    createMeeting,
    getMeetings,
    updateMeeting,
    deleteMeeting,
    getAvailableTimes,
    getConsultantsByService
    
};