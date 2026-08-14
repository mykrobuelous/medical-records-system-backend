import { z } from 'zod';

export const createMedicineSchema = z.object({
    medicine: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1),
});

export const updateMedicineSchema = createMedicineSchema.partial();
