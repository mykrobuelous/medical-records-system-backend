import { z } from 'zod';

const vitalsSchema = z.object({
    bloodPressure: z.string().optional(),
    weight: z.number().optional(),
    temperature: z.number().optional(),
    heartRate: z.number().optional(),
});

const consultationFieldsSchema = z.object({
    consultationDate: z.string().min(1),
    chiefComplaint: z.string().trim().min(1),
    subjective: z.string().trim().min(1),
    objective: z.string().trim().min(1),
    assessment: z.string().trim().min(1),
    plan: z.string().trim().min(1),
    vitals: vitalsSchema.optional(),
});

export const createConsultationSchema = consultationFieldsSchema.extend({
    patientId: z.uuid(),
});

export const updateConsultationSchema = consultationFieldsSchema.partial();
