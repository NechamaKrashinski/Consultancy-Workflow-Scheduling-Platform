const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/authController');
const AuthService = require('../../services/authService');

// Mock the AuthService
jest.mock('../../services/authService');
jest.mock('../../utils/logger');

const app = express();
app.use(express.json());

// Setup routes
app.post('/register-client', authController.registerClient);
app.post('/login', authController.login);
app.post('/register-consultant', authController.registerBusinessConsultant);

describe('Auth Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register-client', () => {
        it('should register a client successfully', async () => {
            const mockToken = 'fake-jwt-token';
            AuthService.registerClient.mockResolvedValue(mockToken);

            const clientData = {
                name: 'יוסי כהן',
                email: 'yossi@test.com',
                password: 'Password123!',
                phone: '0501234567'
            };

            const response = await request(app)
                .post('/register-client')
                .send(clientData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('לקוח נרשם בהצלחה');
            expect(response.body.data.token).toBe(mockToken);
            expect(response.body.data.userType).toBe('client');
            expect(AuthService.registerClient).toHaveBeenCalledWith(clientData);
        });

        it('should return 400 when required fields are missing', async () => {
            const incompleteData = {
                name: 'יוסי כהן',
                email: 'yossi@test.com'
                // missing password and phone
            };

            const response = await request(app)
                .post('/register-client')
                .send(incompleteData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('השדות הבאים חסרים');
            expect(response.body.error.code).toBe('MISSING_FIELDS');
            expect(AuthService.registerClient).not.toHaveBeenCalled();
        });

        it('should handle registration errors', async () => {
            AuthService.registerClient.mockRejectedValue(new Error('Email already exists'));

            const clientData = {
                name: 'יוסי כהן',
                email: 'existing@test.com',
                password: 'Password123!',
                phone: '0501234567'
            };

            const response = await request(app)
                .post('/register-client')
                .send(clientData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already exists');
            expect(response.body.error.code).toBe('REGISTRATION_FAILED');
        });
    });

    describe('POST /login', () => {
        it('should login successfully', async () => {
            const mockToken = 'fake-jwt-token';
            AuthService.login.mockResolvedValue({ token: mockToken });

            const loginData = {
                email: 'yossi@test.com',
                password: 'Password123!'
            };

            const response = await request(app)
                .post('/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('התחברות בוצעה בהצלחה');
            expect(response.body.data.token).toBe(mockToken);
            expect(AuthService.login).toHaveBeenCalledWith(loginData);
        });

        it('should return 400 when credentials are missing', async () => {
            const incompleteData = {
                email: 'yossi@test.com'
                // missing password
            };

            const response = await request(app)
                .post('/login')
                .send(incompleteData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('נדרש להזין אימייל וסיסמה');
            expect(response.body.error.code).toBe('MISSING_CREDENTIALS');
            expect(AuthService.login).not.toHaveBeenCalled();
        });

        it('should return 401 for invalid credentials', async () => {
            AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            const loginData = {
                email: 'wrong@test.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
            expect(response.body.error.code).toBe('AUTHENTICATION_FAILED');
        });
    });

    describe('POST /register-consultant', () => {
        it('should register a business consultant successfully', async () => {
            const mockToken = 'fake-jwt-token';
            AuthService.registerBusinessConsultant.mockResolvedValue(mockToken);

            const consultantData = {
                first_name: 'דוד',
                last_name: 'לוי',
                email: 'david@consultant.com',
                password: 'Password123!',
                phone: '0501234567',
                expertise: 'Business Strategy',
                experience_years: 5
            };

            const response = await request(app)
                .post('/register-consultant')
                .send(consultantData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('יועץ עסקי נרשם בהצלחה');
            expect(response.body.data.token).toBe(mockToken);
            expect(response.body.data.userType).toBe('consultant');
            expect(AuthService.registerBusinessConsultant).toHaveBeenCalledWith(consultantData);
        });

        it('should return 400 when consultant required fields are missing', async () => {
            const incompleteData = {
                first_name: 'דוד',
                last_name: 'לוי',
                email: 'david@consultant.com'
                // missing password, phone, expertise, experience_years
            };

            const response = await request(app)
                .post('/register-consultant')
                .send(incompleteData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('השדות הבאים חסרים');
            expect(response.body.error.code).toBe('MISSING_FIELDS');
            expect(AuthService.registerBusinessConsultant).not.toHaveBeenCalled();
        });

        it('should handle consultant registration errors', async () => {
            AuthService.registerBusinessConsultant.mockRejectedValue(new Error('Email already exists'));

            const consultantData = {
                first_name: 'דוד',
                last_name: 'לוי',
                email: 'existing@consultant.com',
                password: 'Password123!',
                phone: '0501234567',
                expertise: 'Business Strategy',
                experience_years: 5
            };

            const response = await request(app)
                .post('/register-consultant')
                .send(consultantData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already exists');
            expect(response.body.error.code).toBe('REGISTRATION_FAILED');
        });
    });

    describe('Response Structure', () => {
        it('should always include standard response fields', async () => {
            const mockToken = 'fake-jwt-token';
            AuthService.registerClient.mockResolvedValue(mockToken);

            const clientData = {
                name: 'טסט משתמש',
                email: 'test@example.com',
                password: 'Password123!',
                phone: '0501234567'
            };

            const response = await request(app)
                .post('/register-client')
                .send(clientData)
                .expect(201);

            // בדיקת מבנה התשובה הסטנדרטי
            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });
});
