# Documentación de la API

La API está documentada con Swagger UI. Puedes acceder a la documentación interactiva en:

- Producción: [https://chatbackendbaio.onrender.com/api-docs](https://chatbackendbaio.onrender.com/api-docs)
- Local: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Endpoints principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/check-username` - Verificar nombre de usuario

### Salas
- `POST /api/rooms` - Crear sala (requiere autenticación)
- `GET /api/rooms` - Listar salas (requiere autenticación)
- `DELETE /api/rooms/:roomId` - Eliminar sala (requiere autenticación)

### Estado
- `GET /api/status/online-users` - Usuarios conectados (requiere autenticación)
- `GET /api/status/:userId` - Estado de un usuario (requiere autenticación)

```
Backend-Chat
├─ config
│  ├─ db.js
│  └─ redis.js
├─ controllers
│  ├─ authController.js
│  ├─ chatController.js
│  ├─ roomController.js
│  └─ statusController.js
├─ middlewares
│  └─ auth.js
├─ models
│  ├─ Room.js
│  └─ User.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ routes
│  ├─ authRoutes.js
│  ├─ roomRoutes.js
│  └─ statusRoutes.js
└─ server.js

```