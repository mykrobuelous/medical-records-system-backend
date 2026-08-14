import { Router } from 'express';
import {
    createPatient,
    deletePatient,
    getPatientById,
    getPatients,
    updatePatient,
} from './patient.controller.js';

const patientRouter = Router();

patientRouter.get('/', getPatients);
patientRouter.get('/:id', getPatientById);
patientRouter.post('/', createPatient);
patientRouter.patch('/:id', updatePatient);
patientRouter.delete('/:id', deletePatient);

export default patientRouter;
