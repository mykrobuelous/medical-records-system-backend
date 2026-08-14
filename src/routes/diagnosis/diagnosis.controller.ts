import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { diagnoses } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { flattenError } from 'zod';
import { createDiagnosisSchema, updateDiagnosisSchema } from './diagnosis.schema.js';

export const getDiagnoses = async (req: Request, res: Response) => {
    try {
        const diagnosisData = await db.select().from(diagnoses);
        return res.json({
            status: 'ok',
            data: diagnosisData,
        });
    } catch (error) {
        console.error('Error fetching diagnoses:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch diagnoses',
        });
    }
};

export const getDiagnosisById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const diagnosisData = await db
            .select()
            .from(diagnoses)
            .where(eq(diagnoses.id, id as string))
            .execute();

        if (diagnosisData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Diagnosis not found',
            });
        }

        return res.json({
            status: 'ok',
            data: diagnosisData[0],
        });
    } catch (error) {
        console.error('Error fetching diagnosis by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch diagnosis',
        });
    }
};

export const createDiagnosis = async (req: Request, res: Response) => {
    const parsed = createDiagnosisSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid diagnosis data',
            errors: flattenError(parsed.error),
        });
    }

    try {
        const [newDiagnosis] = await db.insert(diagnoses).values(parsed.data).returning();

        return res.status(201).json({
            status: 'ok',
            data: newDiagnosis,
        });
    } catch (error) {
        console.error('Error creating diagnosis:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create diagnosis',
        });
    }
};

export const updateDiagnosis = async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateDiagnosisSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid diagnosis data',
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
        const [updatedDiagnosis] = await db
            .update(diagnoses)
            .set(parsed.data)
            .where(eq(diagnoses.id, id as string))
            .returning();

        if (!updatedDiagnosis) {
            return res.status(404).json({
                status: 'error',
                message: 'Diagnosis not found',
            });
        }

        return res.json({
            status: 'ok',
            data: updatedDiagnosis,
        });
    } catch (error) {
        console.error('Error updating diagnosis:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update diagnosis',
        });
    }
};

export const deleteDiagnosis = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [deletedDiagnosis] = await db
            .delete(diagnoses)
            .where(eq(diagnoses.id, id as string))
            .returning();

        if (!deletedDiagnosis) {
            return res.status(404).json({
                status: 'error',
                message: 'Diagnosis not found',
            });
        }

        return res.json({
            status: 'ok',
            data: deletedDiagnosis,
        });
    } catch (error) {
        console.error('Error deleting diagnosis:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete diagnosis',
        });
    }
};
