const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middlewares/auth');

console.log('Importando statusController:', statusController); // Debug log

// Verifica que los métodos del controlador existan
console.log('Methods in controller:', {
  getOnlineUsers: typeof statusController.getOnlineUsers,
  getUserStatus: typeof statusController.getUserStatus
});

// Protege todas las rutas con JWT
router.use(authMiddleware);

console.log('Configurando rutas de estado...'); // Debug log

router.get('/online-users', statusController.getOnlineUsers);
router.get('/:userId', statusController.getUserStatus);

console.log('Rutas de estado configuradas correctamente'); // Debug log

module.exports = router;