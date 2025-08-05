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
        console.log("Creating meeting with parameters:");
        console.log("businessHourId:", req.body.businessHourId);
        
        const meeting = await createMeeting(req.body.businessHourId, req.body.serviceId, req.body.clientId, req.body.date, req.body.startTime, req.body.endTime, req.body.notes);
        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMeetingsController = async (req, res) => {
    try {
        const clientId = req.params.clientId || null;
        const meetings = await getMeetings(clientId);
        res.status(200).json(meetings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateMeetingController = async (req, res) => {
    try {
        await updateMeeting(req.params.id, req.body);
        res.status(200).json({ message: 'Meeting updated successfully' });
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
        const availableTimes = await getAvailableTimes(req.body.dates, req.body.businessConsultantIds);
        res.status(200).json(availableTimes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getConsultantsByServiceController = async (req, res) => {
    try {
        const consultants = await getConsultantsByService(req.params.serviceId);
        res.status(200).json(consultants);
    } catch (error) {
        console.error(error + "------------------------ in getConsultantsByServiceController");
        res.status(400).json({ message: error.message });
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