const businessHoursService = require('../services/businessHoursService'); // נתיב ל-Service

// פונקציה להוסיף שעות עבודה ליועץ
const createBusinessHours = async (req, res) => {
    try {
        const businessHoursData = req.body; // נתוני שעות העבודה מהבקשה
        const newBusinessHours = await businessHoursService.addBusinessHours(businessHoursData);
        res.status(201).json(newBusinessHours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getBusinessHoursByConsultant = async (req, res) => {
    try {
        const consultantId = req.params.consultantId; // נניח שה-ID של היועץ מועבר בכתובת ה-URL
        const businessHours = await businessHoursService.getBusinessHoursByConsultant(consultantId);
        res.json(businessHours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getBusinessHours = async (req, res) => {
    try {
        const businessHours = await businessHoursService.getAllBusinessHours();
        res.json(businessHours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const updateBusinessHours = async (req, res) => {
    const { businessConsultantId, date, newStartTime, newEndTime } = req.body;

    try {
        const result = await businessHoursService.updateBusinessHours(businessConsultantId, date, newStartTime, newEndTime);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    createBusinessHours,
    getBusinessHours,
    getBusinessHoursByConsultant,
    updateBusinessHours
};
