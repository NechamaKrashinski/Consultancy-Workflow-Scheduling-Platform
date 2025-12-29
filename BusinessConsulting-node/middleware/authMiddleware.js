const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // הנחה שהטוקן נשלח בכותרת Authorization
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        req.user = decoded; // שמירת המידע של המשתמש בבקשה
        req.client = decoded; // גם לתאימות לאחור
        next();
    });
};   
 
module.exports = {
    authenticateToken,
};
