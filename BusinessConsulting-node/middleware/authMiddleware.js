const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // הנחה שהטוקן נשלח בכותרת Authorization
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    };

    jwt.verify(token, process.env.JWT_SECRET, (err, client) => {
        if (err) return res.sendStatus(403).json({ error: 'Invalid token' });
        req.client = client; // שמירת המידע של המשתמש בבקשה
        next();
    });
};   
 
module.exports = {
    authenticateToken,
};
