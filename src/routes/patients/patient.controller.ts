import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { patients } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { flattenError } from 'zod';
import { createPatientSchema, updatePatientSchema } from './patient.schema.js';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patientData = await db.select().from(patients);
        return res.json({
            status: 'ok',
            data: patientData,
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const patientData = await db
            .select()
            .from(patients)
            .where(eq(patients.id, id as string))
            .execute();

        if (patientData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found',
            });
        }

        return res.json({
            status: 'ok',
            data: patientData[0],
        });
    } catch (error) {
        console.error('Error fetching patient by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch patient',
        });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    const parsed = createPatientSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid patient data',
            errors: flattenError(parsed.error),
        });
    }

    try {
        const [newPatient] = await db.insert(patients).values(parsed.data).returning();

        return res.status(201).json({
            status: 'ok',
            data: newPatient,
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create patient',
        });
    }
};

export const updatePatient = async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updatePatientSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid patient data',
            errors: flattenError(parsed.error),
        });
    }

    if (Object.keys(parsed.data).length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'No fields provided to update',
        });
    }

    try {
        const [updatedPatient] = await db
            .update(patients)
            .set({ ...parsed.data, updatedAt: new Date() })
            .where(eq(patients.id, id as string))
            .returning();

        if (!updatedPatient) {
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found',
            });
        }

        return res.json({
            status: 'ok',
            data: updatedPatient,
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update patient',
        });
    }
};

export const deletePatient = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // consultations.patient_id has ON DELETE CASCADE, so removing the patient
        // also removes all of their consultations.
        const [deletedPatient] = await db
            .delete(patients)
            .where(eq(patients.id, id as string))
            .returning();

        if (!deletedPatient) {
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found',
            });
        }

        return res.json({
            status: 'ok',
            data: deletedPatient,
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete patient',
        });
    }
};
