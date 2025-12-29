const {
    createMeeting,
    getMeetings,
    updateMeeting,
    deleteMeeting,
    getAvailableTimes,
    getConsultantsByService
} = require('../services/meetingService.js');

const createMeetingController = async (req, res) => {
    try {
        const meeting = await createMeeting(req.body.businessHourId, req.body.serviceId, req.body.clientId, req.body.date, req.body.startTime, req.body.endTime, req.body.notes);
        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMeetingsController = async (req, res) => {
    try {
        let clientId = req.params.clientId || null;
        
        // בדיקת אימות משתמש
        if (req.client) {
            // אם המשתמש הוא לקוח, הוא יכול לראות רק את הפגישות שלו
            if (req.client.role === 'client') {
                // אם המסלול הוא /client/:clientId, נוודא שהלקוח מבקש את הפגישות שלו בלבד
                if (req.params.clientId && req.params.clientId !== req.client.id) {
                    return res.status(403).json({ message: 'Access denied: You can only view your own meetings' });
                }
                
                // אם המסלול הוא /client או /manager, נקבע את clientId לפי הטוקן
                if (!clientId) {
                    // נצטרך לחפש את ה-ID לפי המייל
                    const { Client } = require('../models/associations.js');
                    const client = await Client.findOne({ where: { email: req.client.email } });
                    if (!client) {
                        return res.status(404).json({ message: 'Client not found' });
                    }
                    clientId = client.id;
                }
            }
            // אם המשתמש הוא מנהל, הוא יכול לראות את כל הפגישות
            else if (req.client.role === 'manager') {
                // מנהלים יכולים לראות הכל - clientId יישאר null
                if (req.route.path === '/manager') {
                    clientId = null; // מנהלים רואים הכל
                }
            }
        }
        
        const meetings = await getMeetings(clientId);
        res.status(200).json(meetings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateMeetingController = async (req, res) => {
    try {
        const updatedMeeting = await updateMeeting(req.params.id, req.body);
        res.status(200).json(updatedMeeting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMeetingController = async (req, res) => {
    try {
        await deleteMeeting(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAvailableTimesController = async (req, res) => {
    try {
        const availableTimes = await getAvailableTimes(req.body.dates, req.body.businessConsultantIds, req.body.serviceId);
        res.status(200).json(availableTimes);
    } catch (error) {
        console.error("❌ Error in getAvailableTimesController:", error.message);
        res.status(400).json({ message: error.message });
    }
};

const getConsultantsByServiceController = async (req, res) => {
    try {
        const consultants = await getConsultantsByService(req.params.serviceId);
        res.status(200).json(consultants);
    } catch (error) {
        console.error("❌ Error in getConsultantsByServiceController:", error.message);
        // במקרה של שגיאה, נחזיר array ריק במקום שגיאה כדי שה-map לא יקרוס
        res.status(200).json([]);
    }
};

module.exports = {
    createMeetingController,
    getMeetingsController,
    updateMeetingController,
    deleteMeetingController,
    getAvailableTimesController,
    getConsultantsByServiceController
};