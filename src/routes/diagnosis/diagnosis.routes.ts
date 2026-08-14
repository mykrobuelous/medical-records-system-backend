import { Router } from 'express';
import {
    createDiagnosis,
    deleteDiagnosis,
    getDiagnosisById,
    getDiagnoses,
    updateDiagnosis,
} from './diagnosis.controller.js';

const diagnosisRouter = Router();

diagnosisRouter.get('/', getDiagnoses);
diagnosisRouter.get('/:id', getDiagnosisById);
diagnosisRouter.post('/', createDiagnosis);
diagnosisRouter.patch('/:id', updateDiagnosis);
diagnosisRouter.delete('/:id', deleteDiagnosis);

export default diagnosisRouter;
