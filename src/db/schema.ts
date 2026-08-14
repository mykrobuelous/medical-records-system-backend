import {
    pgTable,
    uuid,
    varchar,
    text,
    date,
    timestamp,
    pgEnum,
    jsonb,
    integer,
} from 'drizzle-orm/pg-core';
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

// ---- Insurance / Diagnosis / Medicine (lookup resources) ----

export const insurances = pgTable('insurances', {
    id: uuid('id').primaryKey().defaultRandom(),
    insurance: varchar('insurance', { length: 255 }).notNull(),
});

export const diagnoses = pgTable('diagnoses', {
    id: uuid('id').primaryKey().defaultRandom(),
    diagnosis: varchar('diagnosis', { length: 255 }).notNull(),
});

export const medicines = pgTable('medicines', {
    id: uuid('id').primaryKey().defaultRandom(),
    medicine: varchar('medicine', { length: 255 }).notNull(),
    description: text('description').notNull(),
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
        height: number;
        weight?: number;
        temperature?: number;
    }>(),

    // Either an insurances.id (uuid string) or the literal 'Personal' for self-pay —
    // mirrors ConsultationType.insurance. Not a DB-level FK since 'Personal' isn't a
    // valid insurances row; validated at the zod layer instead.
    insurance: varchar('insurance', { length: 36 }).notNull(),

    payment: integer('payment').notNull(),

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
