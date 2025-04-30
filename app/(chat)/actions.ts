'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  saveChat
} from '@/lib/db/queries';
import { getPatientById } from '@/lib/db/queries-ehr';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
import { generateUUID } from '@/lib/utils';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

/**
 * Creates a new chat with optional patient context
 */
export async function createChatWithClient({
  userId,
  patientId,
}: {
  userId: string;
  patientId: string | null;
}) {
  const id = generateUUID();
  
  // If a client is selected, create a more specific title
  let title = 'New Chat';
  
  if (patientId) {
    try {
      const patient = await getPatientById(patientId, userId);
      if (patient) {
        title = `Chat about ${patient.firstName} ${patient.lastName}`;
      }
    } catch (error) {
      console.error('Error fetching patient for title', error);
    }
  }
  
  await saveChat({
    id,
    userId,
    title,
    patientId
  });
  
  return id;
}
