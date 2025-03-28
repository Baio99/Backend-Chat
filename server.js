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


// Configuración básica
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: true, // Permite cualquier origen (en desarrollo)
  credentials: true
}));
app.use(express.json());

//  rutas salas
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes); // Nuevas rutas de salas

// Conexión a MongoDB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);

// WebSocket (Chat)
const io = socketio(server, {
  cors: { origin: '*' }, // Ajusta según tu frontend
});

io.on('connection', (socket) => {
  console.log(`⚡: Usuario conectado (ID: ${socket.id})`);

  socket.on('unirseSala', async (roomId) => {
    const room = await Room.findById(roomId);
    if (room) {
      socket.join(roomId);
      io.to(roomId).emit('mensaje', `Usuario se unió a la sala: ${room.name}`);
    }
  });

  socket.on('mensaje', (data) => {
    io.to(data.sala).emit('mensaje', { usuario: socket.id, texto: data.texto });
  });

  socket.on('disconnect', () => {
    console.log('🔥: Usuario desconectado', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});