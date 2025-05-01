'use server';

import { auth } from '@/app/(auth)/auth';
import { saveProgressNote } from '@/lib/db/queries-ehr';
import { revalidatePath } from 'next/cache';

/**
 * Server action to save a finalized SOAP note to a patient's record
 */
export async function saveFinalizedNote({
  patientId,
  noteContent,
}: {
  patientId: string;
  noteContent: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (!patientId || !noteContent) {
    throw new Error('Missing patient ID or note content');
  }

  try {
    await saveProgressNote({
      patientId: patientId,
      authorId: session.user.id,
      content: noteContent,
      draft: false, // Mark as finalized
      // createdAt will be set by the function
    });

    // Revalidate the client page to show the new note
    revalidatePath(`/clients/${patientId}`);
    revalidatePath('/clients'); // Also revalidate the list page

    return { success: true };
  } catch (error) {
    console.error("Server action saveFinalizedNote failed:", error);
    throw new Error("Failed to save the note.");
  }
}
