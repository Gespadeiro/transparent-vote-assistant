
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
    // Extract any potential candidate or party mentions from the prompt
    const candidateMatches = extractCandidateOrPartyNames(prompt);
    
    // Prepare the messages for the API
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Você é um assistente de planos eleitorais que fornece informações detalhadas com base em todas as propostas e dados disponíveis nos planos. ${candidateMatches.length > 0 ? `Analise especificamente as informações sobre ${candidateMatches.join(', ')}.` : 'Analise as informações completas'} Foque nas propostas detalhadas e forneça respostas específicas e relevantes em português europeu.`
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
        max_tokens: 800,
        candidateFilter: candidateMatches.length > 0 ? candidateMatches : null,
      },
    });

    if (error) {
      console.error("Erro ao chamar a função chat-completion:", error);
      throw new Error(error.message || "Falha ao chamar o serviço OpenAI");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao obter chat completion:", error);
    toast.error("Não foi possível obter informações dos planos eleitorais. Por favor, tente novamente.");
    
    // Return a fallback response when the API call fails
    return "Lamento, de momento não consegui aceder às informações detalhadas dos planos eleitorais. Por favor, coloque uma questão diferente ou tente novamente mais tarde.";
  }
};

// Function to extract candidate or party names from the prompt
function extractCandidateOrPartyNames(prompt: string): string[] {
  const candidatesAndParties = [
    // Parties
    "psd", "ps", "be", "cdu", "il", "chega", 
    "social democrata", "socialista", "bloco", "comunista", "pcp", "iniciativa liberal",
    // Add common candidate names here if needed
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  return candidatesAndParties.filter(name => lowerPrompt.includes(name));
}

// Updated mock responses focused on electoral plans
const BOT_RESPONSES: Record<string, string> = {
  "quais são as principais diferenças políticas entre psd e ps?": 
    "Com base nos planos eleitorais na nossa base de dados, o PSD tende a focar-se mais em políticas económicas como a redução fiscal para famílias e empresas, reforma da saúde através de parcerias público-privadas, e descentralização administrativa. O PS geralmente enfatiza o fortalecimento do Estado Social, aumentos graduais do salário mínimo nacional, investimento em habitação pública, e energia renovável.",
  
  "quais são as propostas económicas nos planos eleitorais?": 
    "As propostas económicas nos planos eleitorais variam por partido. Geralmente, incluem medidas de reforma fiscal, estratégias para o crescimento económico, abordagens ao investimento público, e políticas para criação de emprego. Alguns planos enfatizam o investimento público enquanto outros focam-se em incentivos para o setor privado.",
  
  "que reformas de saúde os candidatos estão a propor?": 
    "As propostas de reforma da saúde nos planos eleitorais geralmente abordam a redução das listas de espera, contratação de profissionais de saúde, e melhoria da qualidade do serviço. Alguns planos propõem parcerias público-privadas, enquanto outros enfatizam exclusivamente o fortalecimento do sistema público.",
  
  "quais são as políticas ambientais nos planos eleitorais?": 
    "As políticas ambientais nos planos eleitorais incluem investimento em infraestruturas sustentáveis, desenvolvimento de energia renovável, medidas para atingir metas climáticas, e abordagens para a proteção ambiental. Os detalhes específicos variam por candidato e partido.",
  
  "como os candidatos planeiam abordar questões de habitação?": 
    "As propostas de habitação nos planos eleitorais incluem construção de habitação pública, mecanismos de regulação das rendas, incentivos para o desenvolvimento de habitação acessível, e medidas para enfrentar a escassez de habitação. As abordagens diferem com base na ideologia partidária.",
  
  "que reformas educacionais estão a ser propostas?": 
    "As propostas de reforma educacional geralmente incluem fortalecimento do sistema de educação pública, digitalização e modernização das escolas, valorização dos professores e estratégias de melhoria da qualidade educativa, com variação entre abordagens progressistas e conservadoras."
};
