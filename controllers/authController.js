const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro de usuario
// Registro de usuario - VERSIÓN MEJORADA
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || username.length < 4) {
      return res.status(400).json({ 
        error: 'El usuario debe tener al menos 4 caracteres',
        field: 'username'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres',
        field: 'password'
      });
    }

    // Verificar si el usuario existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está registrado. Por favor elige otro.',
        field: 'username'
      });
    }

    // Crear nuevo usuario
    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ 
      success: true,
      message: '¡Registro exitoso!',
      username: user.username
    });
    
  } catch (error) {
    // Capturar errores de MongoDB (incluyendo duplicados)
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está registrado. Por favor elige otro.',
        field: 'username'
      });
    }
    res.status(400).json({ 
      error: 'Error en el registro. Por favor intenta nuevamente.'
    });
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