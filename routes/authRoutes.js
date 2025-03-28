const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/check-username', authController.checkUsername); // Nueva ruta para validación en tiempo real

module.exports = router;