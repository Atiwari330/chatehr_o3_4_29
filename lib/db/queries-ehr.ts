import 'server-only';

import { and, asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { patient, progressNote, type Patient, type ProgressNote } from './schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function createPatient({
  providerId,
  firstName,
  lastName,
  dob,
  gender,
  diagnoses,
}: Omit<Patient, 'id' | 'createdAt'>) {
  try {
    return await db
      .insert(patient)
      .values({
        providerId,
        firstName,
        lastName,
        dob,
        gender,
        diagnoses,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to create patient in database');
    throw error;
  }
}

export async function listPatientsForProvider({ providerId }: { providerId: string }) {
  try {
    return await db
      .select()
      .from(patient)
      .where(eq(patient.providerId, providerId))
      .orderBy(asc(patient.lastName), asc(patient.firstName));
  } catch (error) {
    console.error('Failed to list patients for provider from database');
    throw error;
  }
}

export async function saveProgressNote({
  patientId,
  authorId,
  content,
  draft = true,
}: Omit<ProgressNote, 'id' | 'createdAt'>) {
  try {
    return await db
      .insert(progressNote)
      .values({
        patientId,
        authorId,
        content,
        draft,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save progress note in database');
    throw error;
  }
}

export async function listNotesForPatient({ patientId }: { patientId: string }) {
  try {
    return await db
      .select()
      .from(progressNote)
      .where(eq(progressNote.patientId, patientId))
      .orderBy(asc(progressNote.createdAt));
  } catch (error) {
    console.error('Failed to list progress notes for patient from database');
    throw error;
  }
} 