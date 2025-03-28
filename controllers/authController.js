const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro de usuario
// Registro de usuario - VERSIÓN MEJORADA
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación básica de frontend (por si falla la del cliente)
    if (!username || username.length < 4) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 4 caracteres' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe ANTES de intentar crearlo
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está en uso',
        code: 'USERNAME_EXISTS'
      });
    }

    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      username: user.username
    });
    
  } catch (error) {
    // Captura errores de MongoDB (incluyendo duplicados por si acaso)
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está en uso',
        code: 'USERNAME_EXISTS'
      });
    }
    res.status(400).json({ error: error.message });
  }
};


// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new Error('Usuario no encontrado');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Contraseña incorrecta');

    const token = jwt.sign({ id: user._id }, 'secreto', { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};