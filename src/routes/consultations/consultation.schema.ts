import { z } from 'zod';

const vitalsSchema = z.object({
    height: z.number(),
    weight: z.number().optional(),
    temperature: z.number().optional(),
});

const consultationFieldsSchema = z.object({
    consultationDate: z.string().min(1),
    chiefComplaint: z.string().trim().min(1),
    subjective: z.string().trim().min(1),
    objective: z.string().trim().min(1),
    assessment: z.string().trim().min(1),
    plan: z.string().trim().min(1),
    vitals: vitalsSchema.optional(),
    insurance: z.union([z.uuid(), z.literal('Personal')]),
    payment: z.number(),
});

export const createConsultationSchema = consultationFieldsSchema.extend({
    patientId: z.uuid(),
});

export const updateConsultationSchema = consultationFieldsSchema.partial();
