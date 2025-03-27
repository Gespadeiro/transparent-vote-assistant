
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced system prompt for PDF processing
const PDF_PROCESSING_PROMPT = `
You have a PDF document containing the electoral plan of a political party for the 2025 Portuguese legislative elections. The document may be long and dense, but your goal is to process and structure the information in a clear and accessible way for an average citizen who wants to understand the party's main proposals.

Follow these steps to accomplish the task:

General Summary: Generate a clear and concise summary of the electoral plan, highlighting the key ideas and the party's overall vision for the country.

Main Topics: Extract and organize the main areas covered in the electoral plan, such as the economy, healthcare, education, security, environment, and fiscal policy, among others.

Key Proposals: For each topic, list the party's main proposals, explained in a straightforward and accessible manner, avoiding overly technical language.

Differentiation: Identify which proposals set this party apart from others or represent a unique stance.

Frequently Asked Questions: Generate a set of common questions a citizen might ask about this electoral plan, ensuring that the AI is prepared to provide clear and document-based answers.

Neutral and Objective Tone: Present the information impartially, without bias or subjective opinions, ensuring that citizens can understand the party's ideas without external influence.

Once the information is extracted, you will be ready to answer direct questions about this party's electoral plan, helping users better understand its proposals and objectives.

Format your response in Markdown for better readability.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { pdfContent, partyName, candidateName } = requestData;

    // Log request data to help debug issues
    console.log("Request received with method:", req.method);
    console.log("Processing electoral PDF for:", candidateName, partyName);
    console.log("PDF content received, length:", pdfContent ? pdfContent.length : "undefined");

    if (!pdfContent) {
      throw new Error("PDF content is required");
    }

    // Prepare a request to the OpenAI API
    console.log("Sending request to OpenAI API");
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: PDF_PROCESSING_PROMPT 
          },
          { 
            role: "user", 
            content: `Please analyze the following electoral plan content for ${candidateName} of the ${partyName} party:\n\n${pdfContent}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2500, // Increased token limit for more detailed responses
      }),
    });

    // Process the response from OpenAI
    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error("Error in OpenAI API:", JSON.stringify(error, null, 2));
      throw new Error(`Error in OpenAI API: ${error.error?.message || "Unknown error"}`);
    }

    const aiResponse = await openAIResponse.json();
    const processedContent = aiResponse.choices[0].message.content;

    console.log("Successfully processed electoral PDF");
    console.log("Processed content length:", processedContent.length);

    return new Response(
      JSON.stringify({
        success: true,
        processedContent,
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  } catch (error) {
    console.error("Error processing electoral PDF:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process the electoral PDF",
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
});
