// const axios = require('axios');

// const newManager = {
//     name: 'Yeuda Rotam',
//     phone: '0527174567',
//     email: 'YeudaRotam@buisness.com',
//     password: 'securepassworD123',
//     role: 'manager' 
   
// };

// axios.post('http://localhost:3000/login/add-manager', newManager)
//     .then(response => {
//         console.log('Manager added successfully:', response.data);
//     })
//     .catch(error => {
//         console.error('Error adding manager:', error.response ? error.response.data : error.message);
//     });

const axios = require('axios');

// פרטי היועצים עם שמות וסיסמאות מאובטחות
const newConsultants = [
    {
        name: 'David Cohen',
        phone: '0521234567',
        email: 'david.cohen@business.com',
        password: 'C0nsult@nt1Secure!', // סיסמה מאובטחת
        role: 'consultant'
    },
    {
        name: 'Maya Levi',
        phone: '0522345678',
        email: 'maya.levi@business.com',
        password: 'M@y@Consultant2!', // סיסמה מאובטחת
        role: 'consultant'
    },
    {
        name: 'Omer Katz',
        phone: '0523456789',
        email: 'omer.katz@business.com',
        password: '0merK@tz3$ecure!', // סיסמה מאובטחת
        role: 'consultant'
    },
    {
        name: 'Tali Schwartz',
        phone: '0524567890',
        email: 'tali.schwartz@business.com',
        password: 'T@liSchw4rtz!', // סיסמה מאובטחת
        role: 'consultant'
    },
    {
        name: 'Ronit Friedman',
        phone: '0525678901',
        email: 'ronit.friedman@business.com',
        password: 'R0nitFriedm@n5!', // סיסמה מאובטחת
        role: 'consultant'
    }
];

// פונקציה אסינכרונית להוספת יועצים
const addConsultants = async () => {
    try {
        // הוספת היועצים
        for (const consultant of newConsultants) {
            try {
                const consultantResponse = await axios.post('http://localhost:3000/login/add-manager', consultant);
                console.log('Consultant added successfully:', consultantResponse.data);
            } catch (error) {
                console.error('Error adding consultant:', error.response ? error.response.data : error.message);
            }
        }
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
    }
};

// קריאה לפונקציה
addConsultants();
