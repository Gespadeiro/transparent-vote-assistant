
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key is set
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Parse request
    const { pdfBase64, candidateName, party } = await req.json();

    // Validate input
    if (!pdfBase64) {
      throw new Error('PDF content is required');
    }

    console.log(`Processing electoral PDF for ${candidateName} (${party})`);

    // Call OpenAI API to analyze the PDF content
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
            content: 'Você é um especialista em análise de programas eleitorais políticos. Analise o conteúdo do PDF fornecido e extraia as propostas principais, organizadas por categorias como economia, saúde, educação, etc. Formate o texto em Markdown.'
          },
          {
            role: 'user',
            content: `Analise este programa eleitoral do partido ${party} e do candidato ${candidateName}. Extraia e resuma as propostas principais organizadas por categoria. Formate em Markdown. Conteúdo do PDF:\n\n${pdfBase64.substring(0, 100000)}`
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log('PDF processed successfully');

    return new Response(JSON.stringify({ proposals: content }), {
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
