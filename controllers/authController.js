const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registro de usuario
// Registro de usuario - VERSIÓN MEJORADA
// Registro de usuario - VERSIÓN CORREGIDA
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // PRIMERO verificar si el usuario existe (antes de validar longitud)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está registrado. Por favor elige otro.',
        field: 'username',
        code: 'USERNAME_EXISTS'
      });
    }

    // LUEGO validar longitud de campos
    if (!username || username.length < 4) {
      return res.status(400).json({ 
        error: 'El usuario debe tener al menos 4 caracteres',
        field: 'username',
        code: 'USERNAME_TOO_SHORT'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres',
        field: 'password',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Si pasa todas las validaciones, crear usuario
    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ 
      success: true,
      message: '¡Registro exitoso!',
      username: user.username
    });
    
  } catch (error) {
    // Capturar errores de MongoDB (duplicados)
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está registrado. Por favor elige otro.',
        field: 'username',
        code: 'USERNAME_EXISTS'
      });
    }
    res.status(400).json({ 
      error: 'Error en el registro. Por favor intenta nuevamente.',
      code: 'REGISTRATION_ERROR'
    });
  }
};


// Función para verificar usuario (opcional pero recomendada)
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    
    // PRIMERO verificar si existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ 
        exists: true,
        valid: false,
        error: 'El nombre de usuario ya está registrado'
      });
    }
    
    // LUEGO validar longitud
    if (!username || username.length < 4) {
      return res.json({ 
        exists: false,
        valid: false,
        error: 'El usuario debe tener al menos 4 caracteres'
      });
    }
    
    res.json({ 
      exists: false,
      valid: true
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error verificando usuario',
      code: 'CHECK_ERROR'
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