import { cookies } from 'next/headers';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import { NewChatContainer } from '@/components/new-chat-container';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const selectedChatModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return <NewChatContainer session={session} selectedModelId={selectedChatModel} />;
}
