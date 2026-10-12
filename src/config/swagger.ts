import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DreamSaver API',
            version: '1.0.0',
            description:
                'REST API for DreamSaver'
        },
        servers: [
            {
                url: "/api/v1",
            },
        ],
        tags: [
            { name: 'Users' },
            { name: 'Deposits' },
            { name: 'Funds' },
            { name: 'Dreams' },
            { name: 'Balance' },
        ],
        components: {
            parameters: {
                IdParam: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'MongoDB ObjectId (24 hex characters)',
                },
                UserIdQuery: {
                    in: 'query',
                    name: 'userId',
                    required: false,
                    schema: { type: 'string' },
                    description: 'Only return items that belong to this user',
                },
            },
        },
    },
    apis: ['./src/controllers/*.ts', './src/models/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);