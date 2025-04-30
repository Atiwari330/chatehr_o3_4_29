import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getPatientById, updatePatient } from '@/lib/db/queries-ehr';
import { z } from 'zod';

// Define validation schema - same as creation but all fields optional except required ones
const patientUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  gender: z.string().optional(),
  diagnoses: z.array(z.string()).optional(),
  profile: z.record(z.any()).optional(), // Flexible JSON object for extended attributes
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await getPatientById(params.id, session.user.id);
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if patient exists and belongs to this provider
    const existingPatient = await getPatientById(params.id, session.user.id);
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = patientUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    // Update patient
    const { gender, diagnoses, profile, ...restData } = result.data;
    const updatedPatient = await updatePatient({
      id: params.id,
      ...restData,
      gender: gender || null,
      diagnoses: diagnoses || null, 
      profile: profile || null,
      providerId: session.user.id,
      createdAt: existingPatient.createdAt // Keep original creation date
    });

    return NextResponse.json(updatedPatient[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}
