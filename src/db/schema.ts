import { pgTable, uuid, varchar, text, date, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- Enums ----

export const sexEnum = pgEnum('sex', ['male', 'female']);

export const bloodTypeEnum = pgEnum('blood_type', [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    'unknown',
]);

// ---- Patients ----

export const patients = pgTable('patients', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    middleName: varchar('middle_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    sex: sexEnum('sex').notNull(),
    bloodType: bloodTypeEnum('blood_type').default('unknown'),
    contactNumber: varchar('contact_number', { length: 20 }).notNull(),
    address: text('address'),
    allergies: text('allergies'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Consultations ----

export const consultations = pgTable('consultations', {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
        .notNull()
        .references(() => patients.id, { onDelete: 'cascade' }),
    consultationDate: date('consultation_date').notNull(),
    chiefComplaint: text('chief_complaint').notNull(),

    // SOAP
    subjective: text('subjective').notNull(),
    objective: text('objective').notNull(),
    assessment: text('assessment').notNull(),
    plan: text('plan').notNull(),

    // Vitals — stored as jsonb to mirror the nested `vitals` object in ConsultationType.
    // See note below on the tradeoffs of this vs. flat columns.
    vitals: jsonb('vitals').$type<{
        bloodPressure?: string;
        weight?: number;
        temperature?: number;
        heartRate?: number;
    }>(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Relations ----

export const patientsRelations = relations(patients, ({ many }) => ({
    consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
    patient: one(patients, {
        fields: [consultations.patientId],
        references: [patients.id],
    }),
}));
