
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

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
    // Get the request body
    const { messages, temperature = 0.7 } = await req.json();

    console.log(`Processing chat completion request with ${messages.length} messages`);

    // Make sure we have an OpenAI API key
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a more affordable model with good capabilities
        messages: [
          // Add a custom system message to focus on Portuguese politics
          {
            role: "system",
            content: "Você é um assistente especializado em política portuguesa. Você fornece informações precisas sobre candidatos políticos, partidos e propostas eleitorais em Portugal. Todos os seus exemplos e referências devem ser relevantes para o contexto político português. Sempre dê respostas em português europeu."
          },
          ...messages
        ],
        temperature: temperature,
      }),
    });

    // Check if the response is ok
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", JSON.stringify(error, null, 2));
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    // Parse the response
    const data = await response.json();

    // Return the response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat-completion function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
