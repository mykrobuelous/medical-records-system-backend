import { Router } from 'express';
import { loginUser } from './auth.controller.js';

const authRouter = Router();

authRouter.post('/', loginUser);

export default authRouter;
