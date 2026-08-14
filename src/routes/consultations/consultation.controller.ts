import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { consultations } from '../../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { flattenError } from 'zod';
import { createConsultationSchema, updateConsultationSchema } from './consultation.schema.js';

export const getConsultations = async (req: Request, res: Response) => {
    try {
        const consultationData = await db.select().from(consultations);
        return res.json({
            status: 'ok',
            data: consultationData,
        });
    } catch (error) {
        console.error('Error fetching consultations:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch consultations',
        });
    }
};

export const getConsultationById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const consultationData = await db
            .select()
            .from(consultations)
            .where(eq(consultations.id, id as string))
            .execute();

        if (consultationData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Consultation not found',
            });
        }

        return res.json({
            status: 'ok',
            data: consultationData[0],
        });
    } catch (error) {
        console.error('Error fetching consultation by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch consultation',
        });
    }
};

export const getConsultationsByPatientId = async (req: Request, res: Response) => {
    const { patientId } = req.params;

    try {
        const consultationData = await db
            .select()
            .from(consultations)
            .where(eq(consultations.patientId, patientId as string))
            .orderBy(desc(consultations.consultationDate));

        return res.json({
            status: 'ok',
            data: consultationData,
        });
    } catch (error) {
        console.error('Error fetching consultations for patient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch consultations',
        });
    }
};

export const createConsultation = async (req: Request, res: Response) => {
    const parsed = createConsultationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid consultation data',
            errors: flattenError(parsed.error),
        });
    }

    try {
        const [newConsultation] = await db.insert(consultations).values(parsed.data).returning();

        return res.status(201).json({
            status: 'ok',
            data: newConsultation,
        });
    } catch (error) {
        // Postgres foreign_key_violation — patientId doesn't reference an existing patient.
        if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
            return res.status(400).json({
                status: 'error',
                message: 'Patient not found',
            });
        }

        console.error('Error creating consultation:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create consultation',
        });
    }
};

export const updateConsultation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateConsultationSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid consultation data',
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
        const [updatedConsultation] = await db
            .update(consultations)
            .set(parsed.data)
            .where(eq(consultations.id, id as string))
            .returning();

        if (!updatedConsultation) {
            return res.status(404).json({
                status: 'error',
                message: 'Consultation not found',
            });
        }

        return res.json({
            status: 'ok',
            data: updatedConsultation,
        });
    } catch (error) {
        console.error('Error updating consultation:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update consultation',
        });
    }
};

export const deleteConsultation = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [deletedConsultation] = await db
            .delete(consultations)
            .where(eq(consultations.id, id as string))
            .returning();

        if (!deletedConsultation) {
            return res.status(404).json({
                status: 'error',
                message: 'Consultation not found',
            });
        }

        return res.json({
            status: 'ok',
            data: deletedConsultation,
        });
    } catch (error) {
        console.error('Error deleting consultation:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete consultation',
        });
    }
};
