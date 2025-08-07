require('dotenv').config();

// Environment validation - בדיקת משתני סביבה חובה
const requiredEnvVars = {
    'JWT_SECRET': 'JWT Secret key for authentication',
    'DB_HOST': 'Database host address',
    'DB_USER': 'Database username',
    'DB_PASSWORD': 'Database password',
    'DB_NAME': 'Database name'
};

const missingEnvVars = [];
for (const [envVar, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[envVar]) {
        missingEnvVars.push(`${envVar} (${description})`);
    }
}

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

// Additional validation for JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long for security');
    process.exit(1);
}

console.log('✅ Environment validation passed');

const cors = require('cors');
const express = require('express');
const BusinessConsulting = require('./connection/dbConnection');
const { swaggerDocs, swaggerUi } = require('./swagger.js');
const { generalLimiter } = require('./middleware/rateLimitMiddleware');
const logger = require('./utils/logger');

// Routers
const businessConsultantRoutes = require('./routers/businessConsultantRouter.js');
const businessDetailRoutes = require('./routers/businessDetailRouter');
const clientRoutes = require('./routers/clientRouter'); 
const serviceRoutes = require('./routers/serviceRouter');
const loginRouter = require('./routers/authRouter');
const profileRouter = require('./routers/profileRouter');
const consultantServiceRouter = require('./routers/consultantServiceRouter.js');
const businessHoursRoutes = require('./routers/businessHoursRouter.js')
const meetingRoutes = require('./routers/meetingRouter.js');
// Middleware
const { authenticateToken } = require('./middleware/authMiddleware');


const app = express();
const port = process.env.PORT || 3000;

// Middleware - Rate limiting צריך להיות לפני cors ו-json parsing
app.use(generalLimiter);
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Routes
app.use('/login', loginRouter);
// app.use(authenticateToken); 
app.use('/profile', profileRouter);
app.use('/consultant-service', consultantServiceRouter);
app.use('/business-details', businessDetailRoutes);
app.use('/clients', clientRoutes);
app.use('/business-hours', businessHoursRoutes);
app.use('/business-consultants', businessConsultantRoutes);
app.use('/meetings', meetingRoutes); 
// app.use('/meeting', meetingRoutes);
app.use('/services', serviceRoutes);

const startServer = async () => {
    try {
        logger.info('Starting Business Consulting Server...', {
            nodeEnv: process.env.NODE_ENV,
            port: port,
            timestamp: new Date().toISOString()
        });
        
        await BusinessConsulting.authenticate();
        logger.database.connection('established', {
            host: process.env.DB_HOST,
            database: process.env.DB_NAME
        });

        // Sync models here
        await BusinessConsulting.sync({ force: false }); 
        logger.database.connection('synchronized', {
            message: 'All models synchronized successfully'
        });

        app.listen(port, () => {
            logger.info('Server started successfully', {
                port: port,
                environment: process.env.NODE_ENV,
                url: `http://localhost:${port}`,
                timestamp: new Date().toISOString()
            });
            
            // Console output only in development for immediate feedback
            if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Server is running at http://localhost:${port}`);
            }
        });
    } catch (err) {
        logger.database.error('Failed to start server', err, {
            port: port,
            environment: process.env.NODE_ENV
        });
        
        logger.error('Server startup failed', err, {
            timestamp: new Date().toISOString()
        });
        
        console.error('❌ Unable to connect to the database:', err);
        process.exit(1);
    }
};

startServer();
