
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
    // Create a system message to instruct the AI about its role
    const systemMessage: ChatMessage = {
      role: "system",
      content: "Você é um assistente especializado em planos eleitorais portugueses. Forneça informações factuais e imparciais baseadas nos dados disponíveis sobre os programas eleitorais dos partidos. Responda de maneira concisa e informativa."
    };
    
    // Format previous messages and add the current prompt
    const messages: ChatMessage[] = [
      systemMessage,
      ...previousMessages,
      { role: "user", content: prompt }
    ];
    
    console.log("Sending request to OpenAI with messages:", messages);
    
    // Call OpenAI API through Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("openai-chat", {
      body: { messages, model: "gpt-4o", temperature: 0.7 }
    });
    
    if (error) {
      console.error("Erro ao invocar edge function:", error);
      throw new Error(error.message);
    }
    
    if (!data || !data.content) {
      console.error("Resposta inválida da API:", data);
      throw new Error("Resposta inválida da API");
    }
    
    console.log("Received response from OpenAI:", data.content);
    return data.content;
  } catch (error) {
    console.error("Erro ao obter chat completion:", error);
    toast.error("Não foi possível obter informações dos planos eleitorais. Por favor, tente novamente.");
    
    // Return a fallback response when the API call fails
    return "Lamento, de momento não consegui aceder às informações detalhadas dos planos eleitorais. Por favor, coloque uma questão diferente ou tente novamente mais tarde.";
  }
};
