import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Nelson API Documentation',
            version: '1.0.0',
            description: 'API documentation for Nelson backend services',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                Location: {
                    type: 'object',
                    required: ['name', 'code'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Auto-generated MongoDB ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Location name',
                            example: 'Rwanda',
                        },
                        code: {
                            type: 'string',
                            description: 'Unique location code (uppercase)',
                            example: 'RW',
                        },
                        parent: {
                            type: 'string',
                            description: 'Parent location ID (null for root locations)',
                            example: null,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                    },
                },
                LocationInput: {
                    type: 'object',
                    required: ['name', 'code'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Location name',
                            example: 'Kigali',
                        },
                        code: {
                            type: 'string',
                            description: 'Unique location code',
                            example: 'KGL',
                        },
                        parent: {
                            type: 'string',
                            description: 'Parent location ID (optional)',
                            example: '692593df3eaefe7137d71af0',
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/**/*.js', './index.js'], // Path to files with annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
