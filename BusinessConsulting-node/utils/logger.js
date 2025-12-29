const log4js = require('log4js');
const path = require('path');

// Load configuration - תיקון הנתיב
log4js.configure(path.join(__dirname, '..', 'log4js.json'));

// Create different loggers for different purposes
const loggers = {
    app: log4js.getLogger('default'),
    auth: log4js.getLogger('auth'),
    database: log4js.getLogger('database'),
    error: log4js.getLogger('error')
};

// Set log level based on environment
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    loggers.app = log4js.getLogger('development');
} else if (env === 'production') {
    loggers.app = log4js.getLogger('production');
}

// Helper functions for structured logging
const createLogMessage = (message, metadata = {}) => {
    if (typeof message === 'object') {
        return JSON.stringify({ ...message, ...metadata });
    }
    if (Object.keys(metadata).length > 0) {
        return `${message} | ${JSON.stringify(metadata)}`;
    }
    return message;
};

// Enhanced logger with metadata support
const logger = {
    // General app logging
    info: (message, metadata = {}) => {
        loggers.app.info(createLogMessage(message, metadata));
    },
    
    warn: (message, metadata = {}) => {
        loggers.app.warn(createLogMessage(message, metadata));
    },
    
    debug: (message, metadata = {}) => {
        loggers.app.debug(createLogMessage(message, metadata));
    },
    
    // Error logging with stack traces
    error: (message, error = null, metadata = {}) => {
        const errorData = {
            ...metadata,
            timestamp: new Date().toISOString()
        };
        
        if (error) {
            errorData.error = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
        }
        
        loggers.error.error(createLogMessage(message, errorData));
    },
    
    // Authentication specific logging
    auth: {
        success: (action, user, metadata = {}) => {
            loggers.auth.info(createLogMessage(`Auth Success: ${action}`, {
                userId: user.id || user.email,
                userType: user.role || 'unknown',
                action,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        failure: (action, email, reason, metadata = {}) => {
            loggers.auth.warn(createLogMessage(`Auth Failure: ${action}`, {
                email,
                reason,
                action,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        attempt: (action, email, metadata = {}) => {
            loggers.auth.debug(createLogMessage(`Auth Attempt: ${action}`, {
                email,
                action,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        }
    },
    
    // Database specific logging
    database: {
        query: (query, duration, metadata = {}) => {
            loggers.database.debug(createLogMessage('Database Query', {
                query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        connection: (status, metadata = {}) => {
            loggers.database.info(createLogMessage(`Database ${status}`, {
                status,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        error: (message, error, metadata = {}) => {
            loggers.database.error(createLogMessage(`Database Error: ${message}`, {
                error: error ? {
                    message: error.message,
                    stack: error.stack
                } : null,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        }
    },
    
    // HTTP request logging
    http: {
        request: (req, metadata = {}) => {
            loggers.app.info(createLogMessage('HTTP Request', {
                method: req.method,
                url: req.url,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        response: (req, res, duration, metadata = {}) => {
            loggers.app.info(createLogMessage('HTTP Response', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip || req.connection.remoteAddress,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        }
    },
    
    // Security logging
    security: {
        rateLimitHit: (ip, endpoint, metadata = {}) => {
            loggers.auth.warn(createLogMessage('Rate Limit Exceeded', {
                ip,
                endpoint,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        },
        
        suspiciousActivity: (activity, details, metadata = {}) => {
            loggers.auth.error(createLogMessage(`Suspicious Activity: ${activity}`, {
                activity,
                details,
                timestamp: new Date().toISOString(),
                ...metadata
            }));
        }
    }
};

// Graceful shutdown
const shutdown = () => {
    log4js.shutdown((err) => {
        if (err) {
            console.error('Error during log4js shutdown:', err);
        }
        process.exit(0);
    });
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = logger;
