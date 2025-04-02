const { createClient } = require('redis');

const redisConfig = {
  username: process.env.REDIS_USER || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
};

// Creamos una instancia única del cliente Redis
const redisClient = createClient(redisConfig);

// Configuramos los listeners de eventos
redisClient.on('error', (err) => console.log('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Conectando a Redis...'));
redisClient.on('ready', () => console.log('Redis listo para usar'));
redisClient.on('reconnecting', () => console.log('Reconectando a Redis...'));
redisClient.on('end', () => console.log('Conexión Redis cerrada'));

// Función para conectar y exportar el cliente
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Conectado a Redis Cloud exitosamente');
    return redisClient;
  } catch (err) {
    console.error('Error al conectar a Redis:', err);
    throw err;
  }
};

// Exportamos tanto el cliente como la función de conexión
module.exports = {
  redisClient,
  connectRedis
};