const Room = require('../models/Room');
const User = require('../models/User');

// Crear sala
exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    const room = new Room({ name, createdBy: userId });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar sala (solo creador o admin)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await Room.findOne({ _id: roomId, createdBy: userId });
    if (!room) throw new Error('No tienes permisos para eliminar esta sala');

    await Room.deleteOne({ _id: roomId });
    res.json({ message: 'Sala eliminada' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

// Listar salas disponibles
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};