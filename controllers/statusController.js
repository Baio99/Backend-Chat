// Cambia la importación
const { redisClient } = require('../config/redis');

console.log('Inicializando statusController...'); // Debug log


// Espera a que Redis esté conectado antes de manejar peticiones
const ensureRedisConnected = async () => {
    try {
      if (!redisClient.isOpen) {
        console.log('Redis no conectado, esperando conexión...');
        await redisConnection;
      }
    } catch (err) {
      console.error('Error en conexión Redis:', err);
      throw err;
    }
  };

  const statusController = {
    getOnlineUsers: async (req, res) => {
      console.log('Ejecutando getOnlineUsers');
      try {
        // Verificar conexión Redis
        if (!redisClient || !redisClient.isOpen) {
          throw new Error('Conexión a Redis no disponible');
        }
  
        const keys = await redisClient.keys('user:*');
        console.log(`Encontradas ${keys.length} keys de usuario`);
        
        const users = [];
        
        for (const key of keys) {
          const userData = await redisClient.hGetAll(key);
          if (userData && userData.online === 'true') {
            users.push({
              userId: key.split(':')[1],
              username: userData.username || 'Desconocido',
              currentRoom: userData.currentRoom || null,
              lastSeen: userData.lastSeen || new Date().toISOString()
            });
          }
        }
        
        console.log(`Devolviendo ${users.length} usuarios online`);
        res.json(users);
      } catch (error) {
        console.error('Error en getOnlineUsers:', error);
        res.status(500).json({ 
          error: 'Error obteniendo usuarios online',
          details: error.message 
        });
      }
    },
  
  

  getUserStatus: async (req, res) => {
    console.log('Ejecutando getUserStatus para ID:', req.params.userId); // Debug log
    try {
      const { userId } = req.params;
      const userData = await redisClient.hGetAll(`user:${userId}`);
      
      if (!userData || !userData.username) {
        console.log('Usuario no encontrado en Redis'); // Debug log
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      console.log('Estado del usuario encontrado:', userData); // Debug log
      res.json({
        userId,
        username: userData.username,
        online: userData.online === 'true',
        currentRoom: userData.currentRoom || null,
        lastSeen: userData.lastSeen
      });
    } catch (error) {
      console.error('Error en getUserStatus:', error); // Debug log
      res.status(500).json({ error: 'Error obteniendo estado del usuario' });
    }
  }
};

console.log('statusController exportado:', statusController); // Debug log
module.exports = statusController;