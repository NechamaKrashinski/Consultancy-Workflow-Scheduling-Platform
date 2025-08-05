const { Meeting, Service, Client, BusinessHours, BusinessConsultant, ConsultantService } = require('../models/associations.js');const { Sequelize, Op } = require('sequelize');

// פונקציות ניהול פגישות
const createMeeting = async (businessHourId, serviceId, clientId, date, startTime, endTime, notes = '') => {
    // 1. בדיקות תקינות של הפרמטרים
    console.log("Creating meeting with parameters:");
    console.log("businessHourId:", businessHourId);
    console.log("serviceId:", serviceId);
    console.log("clientId:", clientId);
    console.log("date:", date);
    console.log("startTime:", startTime);
    console.log("endTime:", endTime);
    
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
    
    // 5. קבלת זמני הפגישות הפנויים
    // const meetings = await getAvailableTimes([date], [consultantId]);

    // // 6. בדוק אם הזמן שביקש הלקוח פנוי
    // const isSlotAvailable = meetings.some(slot =>
    //     slot.start_time <= startTime && slot.end_time >= endTime
    // );

    const meetings = await getAvailableTimes([date], [consultantId]);
    console.log("Available meetings for consultant:", meetings);
    
// בדוק אם meetings הוא אובייקט
  let isSlotAvailable = true; // הנח שהזמן פנוי בהתחלה

// if (meetings && meetings[consultantId] && meetings[consultantId][date]) {
//     const availableSlots = meetings[consultantId][date];
//     isSlotAvailable = availableSlots.every(slot =>
//     (endTime <= slot.start || startTime >= slot.end));


//     console.log("Is the requested time slot available?", isSlotAvailable);
// } else {
//     console.error("No available meetings found for the specified consultant and date:", meetings);
//     isSlotAvailable = false; // אם אין פגישות זמינות, הנח שהזמן לא פנוי
// }
if (!meetings) {
    console.error("Meetings object is undefined or null.");
    isSlotAvailable = false;
    console.log("isSlotAvailable:", isSlotAvailable);
}

if (!meetings[consultantId]) {
    console.error("No meetings found for consultant ID:", consultantId);
    isSlotAvailable = false;
    console.log("isSlotAvailable:", isSlotAvailable);
}

if (!meetings[consultantId][date]) {
    console.error("No meetings found for the specified date:", date);
    isSlotAvailable = false;
    console.log("isSlotAvailable:", isSlotAvailable);
}

if (!meetings[consultantId][date].length) {
    console.error("No available slots found for the specified date:", date);
    isSlotAvailable = false;
    console.log("isSlotAvailable:", isSlotAvailable);
}

if (meetings && meetings[consultantId] && meetings[consultantId][date] && meetings[consultantId][date].length > 0) {
    const availableSlots = meetings[consultantId][date];
    console.log("Available slots:", availableSlots);
     
   const formattedStartTime = startTime + ":00"; // הוספת שניות
const formattedEndTime = endTime + ":00"; // הוספת שניות

isSlotAvailable = availableSlots.every(slot => {
    const isAvailable = (formattedStartTime >= slot.start && formattedEndTime <= slot.end);
    console.log(`Checking slot: ${JSON.stringify(slot)} - Is available: ${isAvailable}  end: ${formattedEndTime} start: ${formattedStartTime}`);
    return isAvailable;
});

console.log("Is the requested time slot available?", isSlotAvailable);


    console.log("Is the requested time slot available?", isSlotAvailable);
} else {
    console.error("No available meetings found for the specified consultant and date:", meetings);
    isSlotAvailable = false; // אם אין פגישות זמינות, הנח שהזמן לא פנוי
}

if (!isSlotAvailable) {
    throw new Error('The selected time slot is not available.');
}


    // 7. יצירת הפגישה
    const meeting = await Meeting.create({
        business_hour_id: businessHourId,
        client_id: clientId,
        service_id: serviceId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'booked',
        notes: notes,
    });

    return meeting; // מחזיר את הפגישה שנוצרה
};

const updateMeeting = async (id, meetingData) => {
    await Meeting.update(meetingData, { where: { id } });
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



// פונקציות לקבלת שעות עסקים ופגישות
// const getBusinessHours = async (businessConsultantId, formattedDate) => {
//     console.log("Getting business hours for consultant ID:", businessConsultantId, "on date:", formattedDate);
//     let formattedBusinessHours = [];
//     try {
//     // const businessHours = await BusinessHours.findAll({
//     //     where:{
//     //         business_consultant_id: businessConsultantId,
//     //         date: formattedDate,
//     //         is_active: true
//     //     }
//     // });

//    const businessHours = await BusinessHours.findAll({
//     where: {
//         business_consultant_id: businessConsultantId,
//         date: formattedDate,
//         is_active: true
//     }
//     });

//     // המרה של start_time ו-end_time לאחר קבלת התוצאות
//     formattedBusinessHours = businessHours.map(hour => ({
//         id: hour.id,
//         business_consultant_id: hour.business_consultant_id,
//         date: hour.date,
//         start_time: hour.start_time.toISOString().substr(11, 8), // חיתוך השעה
//         end_time: hour.end_time.toISOString().substr(11, 8), // חיתוך השעה
//         is_active: hour.is_active
//     }));

//     formattedBusinessHours.forEach(hour => {
        
//         console.log("/////////////////////", JSON.stringify(hour, null, 2)); // המרה ל-JSON
//     });
// } catch (error) {
//     console.error('Error fetching business hours:', error);
// }

//     return await formattedBusinessHours.findAll({
//         where: {
//             business_consultant_id: businessConsultantId,
//             date: formattedDate,
//             is_active: true
//         }
//     });
// };
const getBusinessHours = async (businessConsultantId, formattedDate) => {
    console.log("Getting business hours for consultant ID:", businessConsultantId, "on date:", formattedDate);
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

        formattedBusinessHours.forEach(hour => {
            console.log("/////////////////////", JSON.stringify(hour, null, 2)); // המרה ל-JSON
        });
    } catch (error) {
        console.error('Error fetching business hours:', error);
    }

    return formattedBusinessHours; // החזר את המערך המפורמט
};


const getBookedMeetings = async (formattedDate, businessHours) => {
    return await Meeting.findAll({
        where: {
            date: formattedDate,
            business_hour_id: businessHours.map(hour => hour.id),
            status: ['booked', 'confirmed']
        }
    });
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

const calculateAvailableTimes = (businessHours, bookedTimes) => {
    const availableTimes = [];
    console.log("Calculating available times based on business hours and booked times");
    console.log("Business hours:", businessHours);
    console.log("Booked times:", bookedTimes);
    businessHours.forEach(hour => {
        let currentStart = hour.start_time;
        console.log(`Processing business hour: ${hour.start_time} to ${hour.end_time}`);
        
        for (let i = 0; i < bookedTimes.length; i++) {
            const booked = bookedTimes[i];
            if (booked.start >= hour.end_time) break;

            if (booked.start > currentStart) {
                availableTimes.push({
                    start: currentStart,
                    end: booked.start,
                    businessHourId: hour.id
                });
            }

            currentStart = Math.max(currentStart, booked.end);
        }

        if (currentStart < hour.end_time) {
            availableTimes.push({
                start: currentStart,
                end: hour.end_time,
                businessHourId: hour.id
            });
        }
    });

    return availableTimes.filter(time => time.start < time.end);
};


const getAvailableTimes = async (dates, businessConsultantIds) => {
    console.log("Getting available times for dates:", dates, "and businessConsultantIds:", businessConsultantIds);
    
    if (!dates || !businessConsultantIds || !Array.isArray(dates) || !Array.isArray(businessConsultantIds)) {
        throw new Error('Invalid input: dates and businessConsultantIds must be non-null arrays');
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
            const availableTimes = calculateAvailableTimes(businessHours, bookedTimes);
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