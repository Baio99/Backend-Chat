// swagger/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');
const { version } = require('../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Backend API',
      version,
      description: 'API para sistema de chat en tiempo real',
      contact: {
        name: 'Bryan Adrian',
        email: 'bryanadrian38@hotmail.com'
      },
    },
    servers: [
      {
        url: 'https://chatbackendbaio.onrender.com/api',
        description: 'Servidor en producción'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              example: 'usuario123'
            },
            password: {
              type: 'string',
              example: 'contraseñaSegura123'
            }
          }
        },
        Room: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Sala General'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Mensaje de error descriptivo'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Ruta donde buscará los comentarios JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;