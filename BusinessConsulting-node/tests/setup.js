// הגדרות גלובליות לטסטים
require('dotenv').config({ path: '.env.test' });

// Mock של logger לטסטים
jest.mock('../utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    auth: {
        attempt: jest.fn(),
        success: jest.fn(),
        failure: jest.fn()
    },
    database: {
        connection: jest.fn(),
        query: jest.fn(),
        error: jest.fn()
    }
}));

// הגדרת משתני סביבה לטסטים
process.env.JWT_SECRET = 'test-secret-key-for-jest-testing-environment-very-secure';
process.env.NODE_ENV = 'test';

// הגדרת timeout גלובלי לטסטים
jest.setTimeout(10000);

// ניקוי אחרי כל טסט
afterEach(() => {
    jest.clearAllMocks();
});
