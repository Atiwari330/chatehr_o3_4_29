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
  profile,
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
        profile,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to create patient in database');
    throw error;
  }
}

export async function getPatientById(id: string, providerId: string) {
  try {
    const patients = await db
      .select()
      .from(patient)
      .where(eq(patient.id, id));
    
    // Filter by providerId after fetching to handle null providerId correctly
    const filteredPatients = patients.filter(p => p.providerId && p.providerId === providerId);
    return filteredPatients.length > 0 ? filteredPatients[0] : null;
  } catch (error) {
    console.error('Failed to get patient from database');
    throw error;
  }
}

export async function updatePatient({
  id,
  providerId,
  firstName,
  lastName,
  dob,
  gender,
  diagnoses,
  profile,
}: Patient) {
  try {
    // First get the patient to validate ownership
    const existingPatient = await getPatientById(id, providerId);
    
    if (!existingPatient) {
      throw new Error('Patient not found or you do not have permission to update');
    }
    
    return await db
      .update(patient)
      .set({
        firstName,
        lastName,
        dob,
        gender,
        diagnoses,
        profile,
      })
      .where(eq(patient.id, id))
      .returning();
  } catch (error) {
    console.error('Failed to update patient in database');
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

export async function listProgressNotesForPatient(patientId: string) {
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
