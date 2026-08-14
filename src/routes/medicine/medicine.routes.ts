import { Router } from 'express';
import {
    createMedicine,
    deleteMedicine,
    getMedicineById,
    getMedicines,
    updateMedicine,
} from './medicine.controller.js';

const medicineRouter = Router();

medicineRouter.get('/', getMedicines);
medicineRouter.get('/:id', getMedicineById);
medicineRouter.post('/', createMedicine);
medicineRouter.patch('/:id', updateMedicine);
medicineRouter.delete('/:id', deleteMedicine);

export default medicineRouter;
