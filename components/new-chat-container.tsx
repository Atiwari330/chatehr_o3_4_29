'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientSelector } from '@/components/client-selector';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons';
import { createChatWithClient } from '@/app/(chat)/actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ModelSelector } from '@/components/model-selector';
import type { Session } from 'next-auth';

export function NewChatContainer({ 
  session,
  selectedModelId
}: { 
  session: Session;
  selectedModelId: string;
}) {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const chatId = await createChatWithClient({
        userId: session.user.id,
        patientId: selectedClientId === 'none' ? null : selectedClientId
      });
      
      router.push(`/chat/${chatId}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 p-4">
      <h1 className="text-2xl font-semibold">Start a New Chat</h1>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Choose client (optional):</span>
          <ClientSelector onSelectClient={setSelectedClientId} />
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Model:</span>
          <ModelSelector
            session={session}
            selectedModelId={selectedModelId}
          />
        </div>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleCreateChat} 
            disabled={isCreating}
            className="mt-4 gap-2"
          >
            <PlusIcon />
            <span>{isCreating ? 'Creating...' : selectedClientId ? 'Start Client Chat' : 'Start Chat'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {selectedClientId ? 'Start a new chat with the selected client context' : 'Start a new chat without client context'}
        </TooltipContent>
      </Tooltip>
      
      {selectedClientId && (
        <p className="text-sm text-muted-foreground mt-2">
          The chat will be contextualized with the selected client's information.
        </p>
      )}
    </div>
  );
}
