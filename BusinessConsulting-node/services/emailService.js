// const emailjs = require('@emailjs/nodejs');

// הגדרת EmailJS - זמנית לא פעיל
// emailjs.init({
//     publicKey: process.env.EMAILJS_PUBLIC_KEY, // נוסיף ל-.env
//     privateKey: process.env.EMAILJS_PRIVATE_KEY // נוסיף ל-.env
// });

/**
 * שליחת מייל אישור פגישה ללקוח
 * @param {string} clientEmail - מייל הלקוח
 * @param {object} meetingDetails - פרטי הפגישה
 */
const sendMeetingConfirmation = async (clientEmail, meetingDetails) => {
    try {
        // זמנית - רק לוג ללא שליחת מייל אמיתי
        console.log('📧 [DEMO] Would send meeting confirmation email to:', clientEmail);
        console.log('📧 [DEMO] Meeting details:', {
            client: meetingDetails.clientName,
            consultant: meetingDetails.consultantName,
            service: meetingDetails.serviceName,
            date: meetingDetails.date,
            time: meetingDetails.startTime
        });
        
        // מחזיר הצלחה מדומה
        return { success: true, messageId: 'demo-email-id-' + Date.now() };
        
        /*
        // הקוד האמיתי - יופעל כשה-EmailJS יהיה מוכן
        const templateParams = {
            to_email: clientEmail,
            client_name: meetingDetails.clientName,
            meeting_date: meetingDetails.date,
            meeting_time: meetingDetails.startTime,
            consultant_name: meetingDetails.consultantName,
            service_name: meetingDetails.serviceName,
            meeting_notes: meetingDetails.notes || 'אין הערות נוספות'
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,   // Service ID מהאתר
            process.env.EMAILJS_TEMPLATE_ID,  // Template ID מהאתר
            templateParams
        );

        console.log('✅ Email sent successfully:', response);
        return { success: true, messageId: response.text };
        */
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * שליחת מייל התראה ליועץ על פגישה חדשה
 * @param {string} consultantEmail - מייל היועץ
 * @param {object} meetingDetails - פרטי הפגישה
 */
const sendConsultantNotification = async (consultantEmail, meetingDetails) => {
    try {
        // זמנית - רק לוג ללא שליחת מייל אמיתי
        console.log('📧 [DEMO] Would send consultant notification to:', consultantEmail);
        console.log('📧 [DEMO] New meeting notification for consultant:', meetingDetails.consultantName);
        
        // מחזיר הצלחה מדומה
        return { success: true, messageId: 'demo-consultant-email-' + Date.now() };
        
        /*
        // הקוד האמיתי - יופעל כשה-EmailJS יהיה מוכן
        const templateParams = {
            to_email: consultantEmail,
            consultant_name: meetingDetails.consultantName,
            client_name: meetingDetails.clientName,
            meeting_date: meetingDetails.date,
            meeting_time: meetingDetails.startTime,
            service_name: meetingDetails.serviceName,
            client_phone: meetingDetails.clientPhone,
            meeting_notes: meetingDetails.notes || 'אין הערות מיוחדות'
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_CONSULTANT_TEMPLATE_ID, // Template נפרד ליועצים
            templateParams
        );

        console.log('✅ Consultant notification sent:', response);
        return { success: true, messageId: response.text };
        */
    } catch (error) {
        console.error('❌ Error sending consultant notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * שליחת מייל תזכורת לפגישה (24 שעות לפני)
 * @param {string} clientEmail - מייל הלקוח
 * @param {object} meetingDetails - פרטי הפגישה
 */
const sendMeetingReminder = async (clientEmail, meetingDetails) => {
    try {
        // זמנית - רק לוג ללא שליחת מייל אמיתי
        console.log('📧 [DEMO] Would send meeting reminder to:', clientEmail);
        console.log('📧 [DEMO] Reminder for meeting tomorrow:', meetingDetails.date);
        
        // מחזיר הצלחה מדומה
        return { success: true, messageId: 'demo-reminder-email-' + Date.now() };
        
        /*
        // הקוד האמיתי - יופעל כשה-EmailJS יהיה מוכן
        const templateParams = {
            to_email: clientEmail,
            client_name: meetingDetails.clientName,
            meeting_date: meetingDetails.date,
            meeting_time: meetingDetails.startTime,
            consultant_name: meetingDetails.consultantName,
            service_name: meetingDetails.serviceName,
            reminder_message: 'תזכורת: יש לך פגישה מחר!'
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_REMINDER_TEMPLATE_ID, // Template לתזכורות
            templateParams
        );

        console.log('✅ Reminder sent successfully:', response);
        return { success: true, messageId: response.text };
        */
    } catch (error) {
        console.error('❌ Error sending reminder:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMeetingConfirmation,
    sendConsultantNotification,
    sendMeetingReminder
};
