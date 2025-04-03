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
/**
 * @swagger
 * /status/online-users:
 *   get:
 *     summary: Obtener lista de usuarios online
 *     tags: [Status]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios conectados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *                   currentRoom:
 *                     type: string
 *                     nullable: true
 *                   lastSeen:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error al obtener usuarios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/online-users', statusController.getOnlineUsers);

/**
 * @swagger
 * /status/{userId}:
 *   get:
 *     summary: Obtener estado de un usuario específico
 *     tags: [Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a consultar
 *     responses:
 *       200:
 *         description: Estado del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 username:
 *                   type: string
 *                 online:
 *                   type: boolean
 *                 currentRoom:
 *                   type: string
 *                   nullable: true
 *                 lastSeen:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error al obtener estado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:userId', statusController.getUserStatus);

console.log('Rutas de estado configuradas correctamente'); // Debug log

module.exports = router;