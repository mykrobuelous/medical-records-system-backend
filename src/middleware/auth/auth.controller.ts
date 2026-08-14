import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { flattenError } from 'zod';
import { loginSchema } from './auth.schema.js';
import { checkUser } from './auth.utils.js';

export interface AuthTokenPayload extends JwtPayload {
    username: string;
}

export interface AuthRequest extends Request {
    user?: AuthTokenPayload;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = (process.env.JWT_EXPIRY ?? '1d') as SignOptions['expiresIn'];

export const loginUser = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid login data',
            errors: flattenError(parsed.error),
        });
    }

    const isLoginValid = checkUser(parsed.data.username, parsed.data.password);

    if (!isLoginValid) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or password',
        });
    }

    const token = jwt.sign({ username: parsed.data.username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRY,
    });

    return res.json({
        status: 'ok',
        message: 'Login successful',
        data: token,
    });
};

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Authorization header missing or malformed',
        });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Token missing',
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({
            status: 'error',
            message: 'Invalid or expired token',
        });
    }
};
