import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { insurances } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { flattenError } from 'zod';
import { createInsuranceSchema, updateInsuranceSchema } from './insurance.schema.js';

export const getInsurances = async (req: Request, res: Response) => {
    try {
        const insuranceData = await db.select().from(insurances);
        return res.json({
            status: 'ok',
            data: insuranceData,
        });
    } catch (error) {
        console.error('Error fetching insurances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurances',
        });
    }
};

export const getInsuranceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const insuranceData = await db
            .select()
            .from(insurances)
            .where(eq(insurances.id, id as string))
            .execute();

        if (insuranceData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance not found',
            });
        }

        return res.json({
            status: 'ok',
            data: insuranceData[0],
        });
    } catch (error) {
        console.error('Error fetching insurance by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch insurance',
        });
    }
};

export const createInsurance = async (req: Request, res: Response) => {
    const parsed = createInsuranceSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid insurance data',
            errors: flattenError(parsed.error),
        });
    }

    try {
        const [newInsurance] = await db.insert(insurances).values(parsed.data).returning();

        return res.status(201).json({
            status: 'ok',
            data: newInsurance,
        });
    } catch (error) {
        console.error('Error creating insurance:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create insurance',
        });
    }
};

export const updateInsurance = async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateInsuranceSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid insurance data',
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
        const [updatedInsurance] = await db
            .update(insurances)
            .set(parsed.data)
            .where(eq(insurances.id, id as string))
            .returning();

        if (!updatedInsurance) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance not found',
            });
        }

        return res.json({
            status: 'ok',
            data: updatedInsurance,
        });
    } catch (error) {
        console.error('Error updating insurance:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update insurance',
        });
    }
};

export const deleteInsurance = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [deletedInsurance] = await db
            .delete(insurances)
            .where(eq(insurances.id, id as string))
            .returning();

        if (!deletedInsurance) {
            return res.status(404).json({
                status: 'error',
                message: 'Insurance not found',
            });
        }

        return res.json({
            status: 'ok',
            data: deletedInsurance,
        });
    } catch (error) {
        console.error('Error deleting insurance:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete insurance',
        });
    }
};
