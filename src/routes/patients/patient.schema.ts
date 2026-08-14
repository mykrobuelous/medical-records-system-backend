import { z } from 'zod';

export const sexValues = ['male', 'female'] as const;

export const bloodTypeValues = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    'unknown',
] as const;

export const createPatientSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    middleName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().min(1).max(100),
    dateOfBirth: z.string().min(1),
    sex: z.enum(sexValues),
    bloodType: z.enum(bloodTypeValues).optional(),
    contactNumber: z.string().trim().min(1).max(20),
    address: z.string().trim().optional(),
    allergies: z.string().trim().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
