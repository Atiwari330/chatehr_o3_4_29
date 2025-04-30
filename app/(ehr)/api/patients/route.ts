import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createPatient } from '@/lib/db/queries-ehr';
import { z } from 'zod';

// Define validation schema
const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  gender: z.string().optional(),
  diagnoses: z.array(z.string()).optional(),
  profile: z.record(z.any()).optional(), // Flexible JSON object for extended attributes
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = patientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }

    // Create patient with provider ID from session
    const { gender, diagnoses, profile, ...restData } = result.data;
    await createPatient({
      ...restData,
      gender: gender || null,
      diagnoses: diagnoses || null,
      profile: profile || null,
      providerId: session.user.id
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
