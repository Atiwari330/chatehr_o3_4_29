'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useArtifact } from '@/hooks/use-artifact';
import { nanoid } from 'nanoid';
import { CheckIcon } from 'lucide-react';

export function GenerateSOAPNoteButton({ patientId }: { patientId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clinicianInput, setClinicianInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setArtifact } = useArtifact();

  const handleGenerateNote = async () => {
    if (!clinicianInput.trim()) {
      toast.error("Please provide a brief session summary.");
      return;
    }
    
    setIsGenerating(true);
    setIsDialogOpen(false); // Close dialog
    
    // Create a temporary ID for this generation
    const tempArtifactId = `soap-${nanoid()}`;
    const noteTitle = `SOAP Note Draft`;
    
    // 1. Initialize the artifact to show we're generating content
    setArtifact({
      documentId: tempArtifactId,
      patientId: patientId,
      kind: 'text',
      title: noteTitle,
      content: 'Generating SOAP note...',
      isVisible: true,
      status: 'streaming',
      boundingBox: { 
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 200,
        width: 400, 
        height: 200
      },
    });
    
    try {
      // 2. Call the API to generate the note
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, clinicianInput }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`Failed to generate note: ${response.status}`);
      }
      
      // 3. Process the streaming response
      try {
        if (!response.body) {
          throw new Error("Response body is null");
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        
        console.log("Starting to process stream...");
        
        // Process the response as a text stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("Stream complete");
            break;
          }
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk:", chunk.substring(0, 50) + "...");
          
          try {
            // Check if we're dealing with SSE format (data: {...})
            if (chunk.includes('data:')) {
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  
                  // Check for the [DONE] SSE message
                  if (data === '[DONE]') continue;
                  
                  // Try to parse as JSON 
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    
                    if (content) {
                      accumulatedContent += content;
                      // Update immediately with each content piece
                      setArtifact(prev => ({
                        ...prev,
                        content: accumulatedContent,
                        status: 'streaming',
                      }));
                    }
                  } catch (jsonError) {
                    // Not valid JSON, add the whole line
                    console.log("Not JSON format:", data);
                    accumulatedContent += data;
                  }
                }
              }
            } else {
              // Plain text format - add the whole chunk
              accumulatedContent += chunk;
              
              // Update the artifact with the new content
              setArtifact(prev => ({
                ...prev,
                content: accumulatedContent,
                status: 'streaming',
              }));
            }
          } catch (parseError) {
            console.warn("Error parsing chunk:", parseError);
            // Still add the chunk in case of parsing errors
            accumulatedContent += chunk;
            setArtifact(prev => ({
              ...prev,
              content: accumulatedContent,
              status: 'streaming',
            }));
          }
        }
      } catch (streamError) {
        console.error("Error processing stream:", streamError);
        throw streamError;
      }
      
      // 4. Mark generation as complete
      setArtifact(prev => ({ 
        ...prev, 
        status: 'idle',
        title: `SOAP Note - ${new Date().toLocaleDateString()}`,
      }));
      
      // Clear the input for next time
      setClinicianInput('');
      
      toast.success('SOAP note generated. You can edit it before finalizing.');
      
    } catch (error: any) {
      console.error("Error generating note:", error);
      toast.error(`Error: ${error.message || 'Failed to generate note'}`);
      
      // Reset artifact on error so it doesn't stay in loading state
      setArtifact(prev => ({ 
        ...prev, 
        content: `Error generating note: ${error.message}`,
        status: 'idle' 
      }));
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <CheckIcon size={16} />
          Generate SOAP Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Generate SOAP Note</DialogTitle>
          <DialogDescription>
            Enter a brief summary of the session to generate a SOAP note draft.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Briefly describe today's session (e.g., 'Patient reported improved sleep patterns. We continued CBT exercises for anxiety management and discussed medication compliance.')"
            value={clinicianInput}
            onChange={(e) => setClinicianInput(e.target.value)}
            rows={4}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleGenerateNote} 
            disabled={!clinicianInput.trim() || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
