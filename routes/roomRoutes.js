const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/auth');

// Protege todas las rutas con JWT
router.use(authMiddleware);

router.post('/', roomController.createRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.get('/', roomController.getRooms);

module.exports = router;