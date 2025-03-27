
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
}

export const getChatCompletion = async (
  prompt: string,
  previousMessages: ChatMessage[] = []
): Promise<string> => {
  try {
    // Prepare the messages for the API
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are an electoral plans assistant that provides accurate information based on the electoral plans in the database. Stick to information from the plans and avoid speculating."
      },
      ...previousMessages,
      { role: "user", content: prompt }
    ];

    // For testing purposes, we can use the mock responses
    if (process.env.NODE_ENV === 'development' && prompt.toLowerCase() in BOT_RESPONSES) {
      return BOT_RESPONSES[prompt.toLowerCase()];
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        messages,
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 500,
      },
    });

    if (error) {
      console.error("Error calling chat-completion function:", error);
      throw new Error(error.message || "Failed to call OpenAI service");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    toast.error("Failed to get information from electoral plans. Please try again.");
    
    // Return a fallback response when the API call fails
    return "I'm sorry, I couldn't access the electoral plans information at the moment. Please try asking a different question or try again later.";
  }
};

// Updated mock responses focused on electoral plans
const BOT_RESPONSES: Record<string, string> = {
  "what are the main policy differences between psd and ps?": 
    "Based on the electoral plans in our database, PSD tends to focus more on economic policies like tax reduction for families and businesses, healthcare reform through public-private partnerships, and administrative decentralization. PS typically emphasizes strengthening the social state, gradual minimum wage increases, public housing investment, and renewable energy.",
  
  "what are the economic proposals in the electoral plans?": 
    "The economic proposals in the electoral plans vary by party. Generally, they include tax reform measures, strategies for economic growth, approaches to public investment, and policies for job creation. Some plans emphasize public investment while others focus on private sector incentives.",
  
  "what healthcare reforms are candidates proposing?": 
    "Healthcare reform proposals in the electoral plans typically address waiting list reduction, healthcare professional hiring, and service quality improvement. Some plans propose public-private partnerships, while others emphasize strengthening the public system exclusively.",
  
  "what environmental policies are in the electoral plans?": 
    "The environmental policies in electoral plans include sustainable infrastructure investment, renewable energy development, climate goal achievement measures, and approaches to environmental protection. The specifics vary by candidate and party.",
  
  "how do the candidates plan to address housing issues?": 
    "Housing proposals in the electoral plans include public housing construction, rent regulation mechanisms, incentives for affordable housing development, and measures to address housing shortages. Approaches differ based on party ideology.",
  
  "what educational reforms are being proposed?": 
    "Educational reform proposals typically include public education system strengthening, school digitalization and modernization, teacher value enhancement, and educational quality improvement strategies, with variation between progressive and conservative approaches."
};
