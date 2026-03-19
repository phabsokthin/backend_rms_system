import express from 'express';
import { deleteUser, getUsers, login, logout, register,updateUser } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/create-user', register);
router.get('/get-users', getUsers);
router.delete('/delete-user/:id', deleteUser);
router.put('/update-user/:id', updateUser);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
export default router;