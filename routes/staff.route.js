import express from 'express';
import { createStaff, deleteStaff, getAllStaff, updateStaff,getAllStaffActive } from '../controllers/staff.controller.js';


const router = express.Router();
router.post('/create-staff', createStaff);
router.get('/get-staff', getAllStaff);
router.get('/get-active', getAllStaffActive);
router.put('/update-staff/:id', updateStaff);
router.delete('/delete-staff/:id', deleteStaff);


export default router;