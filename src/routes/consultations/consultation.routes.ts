import { Router } from 'express';
import {
    createConsultation,
    deleteConsultation,
    getConsultationById,
    getConsultations,
    getConsultationsByPatientId,
    updateConsultation,
} from './consultation.controller.js';

const consultationRouter = Router();

consultationRouter.get('/', getConsultations);
consultationRouter.get('/patient/:patientId', getConsultationsByPatientId);
consultationRouter.get('/:id', getConsultationById);
consultationRouter.post('/', createConsultation);
consultationRouter.patch('/:id', updateConsultation);
consultationRouter.delete('/:id', deleteConsultation);

export default consultationRouter;
