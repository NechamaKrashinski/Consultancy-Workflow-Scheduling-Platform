const axios = require('axios');

// נתוני שעות עבודה לדוגמה
const businessHoursData = [
    {
        business_consultant_id: 1,
        date: '2024-12-20',
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_active: true
    },
    {
        business_consultant_id: 1,
        date: '2024-12-21',
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_active: true
    },
    {
        business_consultant_id: 1,
        date: '2024-12-22',
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_active: true
    },
    {
        business_consultant_id: 2,
        date: '2024-12-20',
        start_time: '10:00:00',
        end_time: '18:00:00',
        is_active: true
    },
    {
        business_consultant_id: 2,
        date: '2024-12-21',
        start_time: '10:00:00',
        end_time: '18:00:00',
        is_active: true
    },
    {
        business_consultant_id: 3,
        date: '2024-12-20',
        start_time: '08:00:00',
        end_time: '16:00:00',
        is_active: true
    }
];

// פונקציה אסינכרונית להוספת שעות עבודה
const addBusinessHours = async () => {
    try {
        for (const hours of businessHoursData) {
            try {
                const response = await axios.post('http://localhost:3000/business-hours', hours);
                console.log('Business hours added successfully:', response.data);
            } catch (error) {
                console.error('Error adding business hours:', error.response ? error.response.data : error.message);
            }
        }
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
    }
};

// קריאה לפונקציה
addBusinessHours();