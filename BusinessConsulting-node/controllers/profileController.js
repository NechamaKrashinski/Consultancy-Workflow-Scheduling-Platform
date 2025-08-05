const profileService = require('../services/profileService');

const getProfile = async (req, res) => {
    try {
        // console.log("Fetching profile for user");
        
        const token = req.headers['authorization']?.split(' ')[1];
        const profileData = await profileService.getProfile(token);
        
        return res.status(200).json(profileData);
    } catch (err) {
        console.error(err);
        if (err.message === 'No token provided') {
            return res.status(401).send(err.message);
        } else if (err.message === 'Access denied' || err.message === 'Manager not found' || err.message === 'Client not found') {
            return res.status(404).send(err.message);
        }
        res.status(500).send('Error fetching clients');
    }
};

module.exports = {
    getProfile,
};
