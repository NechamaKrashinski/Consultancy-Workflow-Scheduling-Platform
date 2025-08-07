const rateLimit = require('express-rate-limit');

// הגבלת כללית לכל הבקשות
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 1000, // מקסימום 1000 בקשות ל-15 דקות
    message: {
        error: 'Too Many Requests',
        message: 'יותר מדי בקשות מכתובת ה-IP הזו, נסה שוב בעוד 15 דקות',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // החזר rate limit info ב-`RateLimit-*` headers
    legacyHeaders: false, // בטל `X-RateLimit-*` headers הישנים
});

// הגבלה קפדנית לנתיבי אימות (רישום/התחברות)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 5, // מקסימום 5 ניסיונות התחברות ל-15 דקות
    message: {
        error: 'Too Many Authentication Attempts',
        message: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד 15 דקות',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Reset counter על login מצליח
    skipSuccessfulRequests: true,
});

// הגבלה קפדנית יותר לרישום
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // שעה
    max: 3, // מקסימום 3 רישומים לשעה
    message: {
        error: 'Too Many Registration Attempts',
        message: 'יותר מדי ניסיונות רישום. נסה שוב בעוד שעה',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// הגבלה למניעת spam בפגישות
const meetingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 דקות
    max: 10, // מקסימום 10 פעולות פגישות ל-5 דקות
    message: {
        error: 'Too Many Meeting Requests',
        message: 'יותר מדי פעולות פגישות. נסה שוב בעוד 5 דקות',
        retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// הגבלה לAPI calls כלליים
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 100, // מקסימום 100 בקשות API ל-15 דקות
    message: {
        error: 'API Rate Limit Exceeded',
        message: 'חרגת ממגבלת הבקשות ל-API. נסה שוב בעוד 15 דקות',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// הגבלה מחמירה לפעולות מנהלים
const adminLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 דקות
    max: 50, // מקסימום 50 פעולות מנהל ל-10 דקות
    message: {
        error: 'Admin Rate Limit Exceeded',
        message: 'חרגת ממגבלת הפעולות למנהלים. נסה שוב בעוד 10 דקות',
        retryAfter: '10 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter עבור בקשות סיסמה (אם יש reset password)
const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // שעה
    max: 3, // מקסימום 3 בקשות לאיפוס סיסמה לשעה
    message: {
        error: 'Too Many Password Reset Attempts',
        message: 'יותר מדי בקשות לאיפוס סיסמה. נסה שוב בעוד שעה',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    registrationLimiter,
    meetingLimiter,
    apiLimiter,
    adminLimiter,
    passwordLimiter
};
