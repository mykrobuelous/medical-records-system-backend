import { z } from 'zod';

export const createDiagnosisSchema = z.object({
    diagnosis: z.string().trim().min(1).max(255),
});

export const updateDiagnosisSchema = createDiagnosisSchema.partial();
