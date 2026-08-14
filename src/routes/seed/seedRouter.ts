import { Router } from 'express';
import {
    seedConsultationData,
    seedDiagnosisData,
    seedInsuranceData,
    seedMedicineData,
    seedPatientData,
} from '../../data/seedData.js';
import { consultations, diagnoses, insurances, medicines, patients } from '../../db/schema.js';
import { db } from '../../db/index.js';

const seedRouter = Router();

seedRouter.post('/seed', async (_req, res) => {
    try {
        // Convert string dates to Date objects for insertion
        const patientsToInsert = seedPatientData.map((patient) => ({
            ...patient,
            createdAt: new Date(patient.createdAt),
            updatedAt: patient.updatedAt ? new Date(patient.updatedAt) : undefined,
        }));

        const consultationsToInsert = seedConsultationData.map((consultation) => ({
            ...consultation,
            createdAt: new Date(consultation.createdAt),
        }));

        // Use a transaction to ensure that either all inserts succeed or none do
        await db.transaction(async (tx) => {
            await tx.delete(consultations).execute();
            await tx.delete(patients).execute();
            await tx.delete(insurances).execute();
            await tx.delete(diagnoses).execute();
            await tx.delete(medicines).execute();

            await tx.insert(patients).values(patientsToInsert).onConflictDoNothing();
            await tx.insert(insurances).values(seedInsuranceData).onConflictDoNothing();
            await tx.insert(diagnoses).values(seedDiagnosisData).onConflictDoNothing();
            await tx.insert(medicines).values(seedMedicineData).onConflictDoNothing();

            await tx.insert(consultations).values(consultationsToInsert).onConflictDoNothing();
        });

        return res.json({
            status: 'ok',
            message: 'Seed data inserted successfully',
        });
    } catch (error) {
        console.error('Error seeding data:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Failed to seed data',
        });
    }
});

export default seedRouter;
