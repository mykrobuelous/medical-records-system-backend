import { Router } from 'express';
import {
    createInsurance,
    deleteInsurance,
    getInsuranceById,
    getInsurances,
    updateInsurance,
} from './insurance.controller.js';

const insuranceRouter = Router();

insuranceRouter.get('/', getInsurances);
insuranceRouter.get('/:id', getInsuranceById);
insuranceRouter.post('/', createInsurance);
insuranceRouter.patch('/:id', updateInsurance);
insuranceRouter.delete('/:id', deleteInsurance);

export default insuranceRouter;
