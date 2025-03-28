require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const socketio = require('socket.io');
const http = require('http');

// Configuración básica
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

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

  socket.on('unirseSala', (nombreSala) => {
    socket.join(nombreSala);
    socket.to(nombreSala).emit('mensaje', `Usuario ${socket.id} se unió al chat.`);
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