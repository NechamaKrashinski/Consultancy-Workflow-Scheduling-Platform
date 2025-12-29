const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticateToken', () => {
        it('should authenticate valid token successfully', () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                role: 'client'
            };

            req.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, mockUser);
            });

            authenticateToken(req, res, next);

            expect(req.user).toEqual(mockUser);
            expect(req.client).toEqual(mockUser); // Backward compatibility
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject request without authorization header', () => {
            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No token provided'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject request with malformed authorization header', () => {
            req.headers.authorization = 'InvalidFormat';

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No token provided'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject invalid token', () => {
            req.headers.authorization = 'Bearer invalid-token';
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid token'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle JWT expired error', () => {
            req.headers.authorization = 'Bearer expired-token';
            const expiredError = new Error('Token expired');
            expiredError.name = 'TokenExpiredError';
            
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(expiredError, null);
            });

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid token'
            });
        });

        it('should handle JWT malformed error', () => {
            req.headers.authorization = 'Bearer malformed-token';
            const malformedError = new Error('Token malformed');
            malformedError.name = 'JsonWebTokenError';
            
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(malformedError, null);
            });

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid token'
            });
        });

        it('should add both req.user and req.client for backward compatibility', () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                role: 'manager'
            };

            req.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, mockUser);
            });

            authenticateToken(req, res, next);

            expect(req.user).toEqual(mockUser);
            expect(req.client).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        it('should work with different token formats', () => {
            const testCases = [
                'Bearer token123',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                'Bearer very-long-token-string-here'
            ];

            testCases.forEach((authHeader, index) => {
                // Reset mocks
                jest.clearAllMocks();
                
                const mockUser = { id: index + 1, email: `test${index}@example.com` };
                req.headers.authorization = authHeader;
                jwt.verify.mockImplementation((token, secret, callback) => {
                    callback(null, mockUser);
                });

                authenticateToken(req, res, next);

                expect(req.user).toEqual(mockUser);
                expect(next).toHaveBeenCalled();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', () => {
            req.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Unexpected error'), null);
            });

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid token'
            });
        });

        it('should always include error field in responses', () => {
            authenticateToken(req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(String)
                })
            );
        });
    });
});
