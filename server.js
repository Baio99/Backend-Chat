require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const socketio = require('socket.io');
const http = require('http');
const roomRoutes = require('./routes/roomRoutes');
const authMiddleware = require('./middlewares/auth');
const Room = require('./models/Room');
const statusRoutes = require('./routes/statusRoutes');
const { createAdapter } = require('@socket.io/redis-adapter');
const { connectRedis, redisClient } = require('./config/redis'); // Importamos también redisClient

// Función principal async
const startServer = async () => {
  // Configuración básica
  const app = express();
  const server = http.createServer(app);

  // Middlewares
  app.use(cors({
    origin: true, // Permite cualquier origen (en desarrollo)
    credentials: true
  }));
  app.use(express.json());

  // Rutas
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/status', statusRoutes);

  // Conexión a MongoDB
  await connectDB();
  console.log('MongoDB conectado');

  // Conexión a Redis
  await connectRedis(); // Nos aseguramos que Redis esté conectado
  console.log('Redis conectado');

  // WebSocket (Chat)
  const io = socketio(server, {
    cors: { origin: '*' },
  });

  // Configurar adaptador de Redis para Socket.io
  const subClient = redisClient.duplicate();
  io.adapter(createAdapter(redisClient, subClient));

  // Objeto para mapear socket.id a userId
  const socketToUserMap = {};

  // Eventos de conexión
  io.on('connection', (socket) => {
    console.log(`⚡: Usuario conectado (ID: ${socket.id})`);

    // Almacenar información del usuario
    socket.on('setUserInfo', async (userInfo) => {
      try {
        socket.userInfo = userInfo;
        socketToUserMap[socket.id] = userInfo._id;
        
        // Guardar en Redis con tiempo de expiración (ej. 1 hora)
        await redisClient.hSet(`user:${userInfo._id}`, {
          online: 'true',
          lastSeen: new Date().toISOString(),
          currentRoom: '',
          socketId: socket.id,
          username: userInfo.username
        });
        
        // Establecer tiempo de expiración (opcional)
        await redisClient.expire(`user:${userInfo._id}`, 3600);
        
        console.log(`Usuario ${userInfo.username} marcado como online en Redis`);
        
        io.emit('user-status-changed', { 
          userId: userInfo._id, 
          status: 'online',
          username: userInfo.username
        });
      } catch (error) {
        console.error('Error al guardar usuario en Redis:', error);
      }
    });

    // Unirse a sala
    socket.on('unirseSala', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (room && socket.userInfo) {
          socket.join(roomId);
          
          // Actualizar sala actual en Redis
          await redisClient.hSet(`user:${socket.userInfo._id}`, 'currentRoom', roomId);
          console.log(`Usuario ${socket.userInfo._id} unido a sala ${roomId}`);
          
          io.to(roomId).emit('mensaje', { 
            tipo: 'sistema', 
            texto: `${socket.userInfo.username} se unió a la sala` 
          });
          
          io.to(roomId).emit('user-room-changed', { 
            userId: socket.userInfo._id,
            username: socket.userInfo.username,
            roomId 
          });
        }
      } catch (error) {
        console.error('Error al unirse a sala:', error);
      }
    });

    // Evento "usuario escribiendo"
    socket.on('typing', (roomId) => {
      if (socket.userInfo) {
        io.to(roomId).emit('user-typing', { 
          userId: socket.userInfo._id,
          username: socket.userInfo.username,
          isTyping: true 
        });
        
        setTimeout(() => {
          io.to(roomId).emit('user-typing', { 
            userId: socket.userInfo._id,
            username: socket.userInfo.username,
            isTyping: false 
          });
        }, 3000);
      }
    });

    // Mensajes
    socket.on('mensaje', (data) => {
      if (socket.userInfo) {
        const mensajeCompleto = { 
          usuario: socket.userInfo.username, 
          texto: data.texto,
          sala: data.sala
        };
        io.to(data.sala).emit('mensaje', mensajeCompleto);
      }
    });

    // Eventos de salas
    socket.on('nuevaSala', (room) => {
      io.emit('salaCreada', room);
    });

    socket.on('salaBorrada', (roomId) => {
      io.emit('salaEliminada', roomId);
    });

    // Desconexión
    socket.on('disconnect', async () => {
      console.log('🔥: Usuario desconectado', socket.id);
      const userId = socketToUserMap[socket.id];
      
      if (userId) {
        try {
          await redisClient.hSet(`user:${userId}`, {
            online: 'false',
            lastSeen: new Date().toISOString(),
            currentRoom: ''
          });
          
          io.emit('user-status-changed', { 
            userId, 
            status: 'offline',
            username: socket.userInfo?.username || ''
          });
          
          delete socketToUserMap[socket.id];
        } catch (error) {
          console.error('Error al actualizar estado de desconexión:', error);
        }
      }
    });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
};

// Iniciar el servidor
startServer().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});