import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MAX_CHUNK_SIZE = 90000; // Aproximadamente 90K caracteres por chunk

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Log the start of the function execution
  console.log("process-electoral-pdf function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key is set
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Parse request
    console.log("Parsing request body");
    const requestBody = await req.json();
    console.log("Request body parsed successfully");

    const { pdfBase64, candidateName, party } = requestBody;

    // Validate input
    if (!pdfBase64) {
      console.error("PDF content is missing in the request");
      throw new Error('PDF content is required');
    }

    console.log(`Processing electoral PDF for ${candidateName} (${party})`);
    console.log(`PDF content length: ${pdfBase64.length} characters`);

    // Split the PDF content into chunks if it's too large
    const contentChunks = splitContent(pdfBase64, MAX_CHUNK_SIZE);
    console.log(`Split PDF into ${contentChunks.length} chunks`);

    // Process each chunk and combine the results
    let combinedProposals = "";
    
    for (let i = 0; i < contentChunks.length; i++) {
      console.log(`Processing chunk ${i+1} of ${contentChunks.length}, size: ${contentChunks[i].length} characters`);
      
      const chunkProposals = await processChunkWithOpenAI(contentChunks[i], candidateName, party, i+1, contentChunks.length);
      combinedProposals += chunkProposals + "\n\n";
      
      console.log(`Completed processing chunk ${i+1} of ${contentChunks.length}`);
    }

    console.log('All PDF chunks processed successfully, total content length:', combinedProposals.length);

    return new Response(JSON.stringify({ proposals: combinedProposals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-electoral-pdf function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to split content into chunks of manageable size
function splitContent(content: string, maxSize: number): string[] {
  const chunks: string[] = [];
  
  // If content is smaller than max size, return it as is
  if (content.length <= maxSize) {
    return [content];
  }
  
  // Otherwise, split it into chunks
  let position = 0;
  
  while (position < content.length) {
    // Calculate end position for this chunk
    let endPos = Math.min(position + maxSize, content.length);
    
    // Try to find a natural breaking point (newline, period, etc.) near the end of the chunk
    if (endPos < content.length) {
      // Look for paragraph breaks or sentences near the boundary
      const nearBoundary = content.substring(Math.max(endPos - 1000, position), endPos);
      
      // Try to find paragraph break
      const lastParaBreak = nearBoundary.lastIndexOf('\n\n');
      if (lastParaBreak !== -1) {
        endPos = position + nearBoundary.lastIndexOf('\n\n');
      }
      // If no paragraph break, try to find a sentence end
      else {
        const lastPeriod = nearBoundary.lastIndexOf('. ');
        if (lastPeriod !== -1) {
          endPos = position + lastPeriod + 2; // Include the period and space
        }
      }
    }
    
    // Extract the chunk and add it to the result
    chunks.push(content.substring(position, endPos));
    position = endPos;
  }
  
  console.log(`Split content into ${chunks.length} chunks`);
  return chunks;
}

// Function to process a single chunk with OpenAI
async function processChunkWithOpenAI(
  chunkContent: string, 
  candidateName: string, 
  party: string, 
  chunkNumber: number, 
  totalChunks: number
): Promise<string> {
  console.log(`Calling OpenAI API for chunk ${chunkNumber}/${totalChunks}`);
  
  let systemPrompt = 'Você é um especialista em análise de programas eleitorais políticos. Analise o conteúdo do PDF fornecido e extraia as propostas principais, organizadas por categorias como economia, saúde, educação, etc. Formate o texto em Markdown.';
  
  // Add special instructions if this is one of multiple chunks
  if (totalChunks > 1) {
    systemPrompt += ` Este é o chunk ${chunkNumber} de ${totalChunks} do mesmo documento. Extraia apenas as propostas presentes neste fragmento.`;
  }
  
  let userPrompt = `Analise este programa eleitoral do partido ${party} e do candidato ${candidateName}.`;
  
  if (totalChunks > 1) {
    userPrompt += ` Este é o trecho ${chunkNumber} de ${totalChunks} do programa completo.`;
  }
  
  userPrompt += ` Extraia e resuma as propostas principais organizadas por categoria. Formate em Markdown. Conteúdo do PDF:\n\n${chunkContent}`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`OpenAI API error for chunk ${chunkNumber}:`, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    console.log(`Received successful response from OpenAI API for chunk ${chunkNumber}`);
    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error(`No content in OpenAI response for chunk ${chunkNumber}`, data);
      throw new Error('No content in OpenAI response');
    }

    console.log(`Chunk ${chunkNumber} processed successfully, content length: ${content.length}`);
    return content;
  } catch (error) {
    console.error(`Error processing chunk ${chunkNumber} with OpenAI:`, error);
    return `**Erro ao processar fragmento ${chunkNumber}/${totalChunks}**: ${error.message}`;
  }
}
