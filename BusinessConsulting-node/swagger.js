const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Business Consulting API',
            version: '1.0.0',
            description: 'API documentation for Business Consulting application',
        },
        // components: {
        //     securitySchemes: {
        //         bearerAuth: {
        //             type: 'http',
        //             scheme: 'bearer',
        //             bearerFormat: 'JWT',
        //         },
        //     },
        // },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ['./api-docs/*js', './routers/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    swaggerDocs,
    swaggerUi
};
