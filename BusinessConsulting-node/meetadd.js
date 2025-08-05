const axios = require('axios');



const newMeetings = [
    {
        businessHourId: 7, // זהו ה-ID של השעה העסקית
        serviceId: 27,     // זהו ה-ID של השירות
        clientId: 1,       // זהו ה-ID של הלקוח
        date: '2022-10-01', // תאריך הפגישה
        startTime: '09:00', // שעת התחלה
        endTime: '10:00',   // שעת סיום
        notes: 'First meeting' // הערות
    },
    {
        businessHourId: 8,
        serviceId: 28,
        clientId: 1,
        date: '2022-10-01',
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Second meeting'
    },
    {
        businessHourId: 9,
        serviceId: 29,
        clientId: 1,
        date: '2022-10-02',
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Third meeting'
    }
];

// פונקציה אסינכרונית להוספת פגישות

const addMeetings = async () => {
    try {
        // הוספת הפגישות
        for (const meeting of newMeetings) {
            try {
                const meetingResponse = await axios.post('http://localhost:3000/meetings', meeting);
                console.log('Meeting added successfully:', meetingResponse.data);
            } catch (error) {
                console.error('Error adding meeting:', error.response ? error.response.data : error.message);
            }
        }
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
    }
};

// קריאה לפונקציה
addMeetings();
