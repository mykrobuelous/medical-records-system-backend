import { IDBrand } from '../utils/idUtils.js';

type SexType = 'male' | 'female';

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export type PatientType = {
    id: IDBrand;
    firstName: string;
    middleName?: string; // optional — not everyone has one, or it's unknown
    lastName: string;
    dateOfBirth: string; // ISO date string, e.g. "1985-04-12"
    sex: SexType;
    bloodType?: BloodType; // optional — may be unknown until tested
    contactNumber: string;
    address?: string;
    allergies?: string; // free text, e.g. "Penicillin, Shellfish"
    createdAt: string;
    updatedAt: string;
};

export type ConsultationType = {
    id: IDBrand;
    patientId: IDBrand;
    consultationDate: string; // ISO date string
    chiefComplaint: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    vitals: {
        height?: number; // cm
        weight?: number; // kg
        temperature?: number; // Celsius
    };
    insurance: IDBrand | 'Personal'; // either a valid insurance ID or 'Personal' for self-pay
    payment: number;
    createdAt: string;
};

export type InsuranceType = {
    id: IDBrand;
    insurance: string;
};

export type DiagnosisType = {
    id: IDBrand;
    diagnosis: string;
};

export type MedicineType = {
    id: IDBrand;
    medicine: string;
    description: string;
};
