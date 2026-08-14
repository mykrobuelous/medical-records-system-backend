import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import seedRouter from './routes/seed/seedRouter.js';
import patientRouter from './routes/patients/patient.routes.js';
import consultationRouter from './routes/consultations/consultation.routes.js';
import authRouter from './middleware/auth/auth.routes.js';
import { authenticateUser } from './middleware/auth/auth.controller.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/login', authRouter);
app.use('/api', authenticateUser, seedRouter);
app.use('/api/patients', authenticateUser, patientRouter);
app.use('/api/consultations', authenticateUser, consultationRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
