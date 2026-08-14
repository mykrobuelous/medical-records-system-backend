import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { medicines } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { flattenError } from 'zod';
import { createMedicineSchema, updateMedicineSchema } from './medicine.schema.js';

export const getMedicines = async (req: Request, res: Response) => {
    try {
        const medicineData = await db.select().from(medicines);
        return res.json({
            status: 'ok',
            data: medicineData,
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch medicines',
        });
    }
};

export const getMedicineById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const medicineData = await db
            .select()
            .from(medicines)
            .where(eq(medicines.id, id as string))
            .execute();

        if (medicineData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Medicine not found',
            });
        }

        return res.json({
            status: 'ok',
            data: medicineData[0],
        });
    } catch (error) {
        console.error('Error fetching medicine by ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch medicine',
        });
    }
};

export const createMedicine = async (req: Request, res: Response) => {
    const parsed = createMedicineSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid medicine data',
            errors: flattenError(parsed.error),
        });
    }

    try {
        const [newMedicine] = await db.insert(medicines).values(parsed.data).returning();

        return res.status(201).json({
            status: 'ok',
            data: newMedicine,
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create medicine',
        });
    }
};

export const updateMedicine = async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateMedicineSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid medicine data',
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
        const [updatedMedicine] = await db
            .update(medicines)
            .set(parsed.data)
            .where(eq(medicines.id, id as string))
            .returning();

        if (!updatedMedicine) {
            return res.status(404).json({
                status: 'error',
                message: 'Medicine not found',
            });
        }

        return res.json({
            status: 'ok',
            data: updatedMedicine,
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update medicine',
        });
    }
};

export const deleteMedicine = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [deletedMedicine] = await db
            .delete(medicines)
            .where(eq(medicines.id, id as string))
            .returning();

        if (!deletedMedicine) {
            return res.status(404).json({
                status: 'error',
                message: 'Medicine not found',
            });
        }

        return res.json({
            status: 'ok',
            data: deletedMedicine,
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete medicine',
        });
    }
};
