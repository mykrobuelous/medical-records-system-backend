import { z } from 'zod';

export const createInsuranceSchema = z.object({
    insurance: z.string().trim().min(1).max(255),
});

export const updateInsuranceSchema = createInsuranceSchema.partial();
