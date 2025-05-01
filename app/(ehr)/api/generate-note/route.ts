import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { buildPatientContext } from '@/lib/ai/patient-context';
import { generateSOAPNotePrompt } from '@/lib/ai/prompts';
import { createDataStreamResponse, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

export async function POST(req: Request) {
  try {
    // Temporarily relaxed auth for debugging
    let userId = 'admin';
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      console.log("No session user, using default 'admin' user for testing");
    }

    // Get patientId and clinicianInput from request body
    const { patientId, clinicianInput } = await req.json();

    if (!patientId || !clinicianInput) {
      return NextResponse.json(
        { error: 'Missing patientId or clinicianInput' },
        { status: 400 }
      );
    }

    // Build patient context
    const patientContext = await buildPatientContext(patientId, userId);
    
    if (!patientContext) {
      return NextResponse.json(
        { error: 'Failed to retrieve patient context' },
        { status: 404 }
      );
    }

    // Generate the prompt
    const prompt = generateSOAPNotePrompt(patientContext, clinicianInput);

    // Create a simple encoder for streaming response
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Function to handle text-delta events
    const handleTextDelta = (textDelta: string) => {
      writer.write(encoder.encode(textDelta));
      console.log("Text delta received:", textDelta.substring(0, 20) + (textDelta.length > 20 ? "..." : ""));
    };
    
    // Start generating and streaming the content
    (async () => {
      try {
        console.log("Starting SOAP note generation...");
        
        // Use direct version of OpenAI API for simplicity
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a medical assistant creating SOAP notes for behavioral health sessions."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            stream: true,
            temperature: 0.7
          })
        });
        
        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }
        
        if (!openaiResponse.body) {
          throw new Error("Response body is null");
        }
        
        // Process the OpenAI SSE stream
        const reader = openaiResponse.body.getReader();
        const decoder = new TextDecoder();
        
        let buffer = '';
        let accumulatedText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("Stream complete");
            break;
          }
          
          // Decode the chunk and process it
          buffer += decoder.decode(value, { stream: true });
          
          // Process any complete SSE messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              // Check for stream completion message
              if (data === '[DONE]') {
                console.log("Stream marked as done");
                continue;
              }
              
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  accumulatedText += content;
                  handleTextDelta(content);
                }
              } catch (err) {
                console.error("Error parsing SSE data:", err);
              }
            }
          }
        }
        
        console.log("SOAP note generation complete");
      } catch (error: any) {
        console.error("Error in SOAP note generation:", error);
        await writer.write(encoder.encode(`Error generating SOAP note: ${error.message}`));
      } finally {
        await writer.close();
      }
    })();
    
    // Return the readable stream as the response
    return new Response(readable);
  } catch (error: any) {
    console.error('Error in /api/generate-note:', error);
    return NextResponse.json(
      { error: `Failed to generate note: ${error.message}` },
      { status: 500 }
    );
  }
}
