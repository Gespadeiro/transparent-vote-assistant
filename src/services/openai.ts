
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
        content: `Você é um assistente de planos eleitorais que fornece informações detalhadas com base em todas as propostas e dados disponíveis nos planos. ${candidateMatches.length > 0 ? `Analise especificamente as informações sobre ${candidateMatches.join(', ')}.` : 'Analise as informações completas'} Foque nas propostas detalhadas e forneça respostas específicas e relevantes em português europeu. Sempre que possível, mencione dados concretos como valores, percentagens, metas quantificáveis e prazos específicos presentes nos planos.`
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
        max_tokens: 1500, // Increased token limit for more detailed responses
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

// Updated mock responses focused on electoral plans with more detailed data
const BOT_RESPONSES: Record<string, string> = {
  "quais são as principais diferenças políticas entre psd e ps?": 
    "Com base nos planos eleitorais na nossa base de dados, o PSD tende a focar-se mais em políticas económicas como a redução fiscal para famílias e empresas (proposta de redução do IRC em 2 pontos percentuais em 4 anos), reforma da saúde através de parcerias público-privadas com objetivo de reduzir listas de espera em 50%, e descentralização administrativa com transferência de 1,2 mil milhões para municípios. O PS geralmente enfatiza o fortalecimento do Estado Social com investimento adicional de 0,5% do PIB, aumentos graduais do salário mínimo nacional para 1000€ até 2026, investimento em habitação pública com meta de 30.000 fogos, e energia renovável visando 90% de eletricidade de fontes renováveis até 2030.",
  
  "quais são as propostas económicas nos planos eleitorais?": 
    "As propostas económicas nos planos eleitorais variam por partido. Entre as medidas mais concretas encontramos: redução do IRC em 2-3 pontos percentuais (PSD e IL), aumento do salário mínimo para 1000€ até 2026 (PS), investimento público de 40 mil milhões em infraestruturas (PS e BE), criação de 150.000 empregos qualificados com incentivos fiscais de 25% (PSD), banco público de investimento com dotação de 5 mil milhões (BE), nacionalização de setores estratégicos (CDU), e simplificação fiscal com redução do número de escalões de IRS de 7 para 3 (IL). Alguns planos defendem ainda uma taxa sobre lucros extraordinários de 33% para o setor energético e bancário, enquanto outros propõem isenções fiscais para startups tecnológicas nos primeiros 3 anos de atividade.",
  
  "que reformas de saúde os candidatos estão a propor?": 
    "As propostas de reforma da saúde incluem: reforço do SNS com contratação de 5.000 profissionais, incluindo 1.000 médicos de família (PS, BE e CDU); criação de 20 novas Unidades de Saúde Familiar em zonas carenciadas (PS); redução das listas de espera em 50% até 2026 com recurso a parcerias público-privadas (PSD e IL); investimento de 300 milhões de euros em equipamentos hospitalares (vários partidos); implementação de um programa nacional de saúde mental com equipas multidisciplinares em cada capital de distrito e orçamento de 85 milhões anuais (PS); criação de uma rede de cuidados paliativos com aumento de 2.000 camas até 2027 (PSD); e transformação digital do SNS com plataforma única de acesso a serviços médicos e meta de 50% das consultas primárias realizáveis por telemedicina até 2026 (PSD e IL).",
  
  "quais são as políticas ambientais nos planos eleitorais?": 
    "As políticas ambientais incluem: investimento de 2-3 mil milhões em energias renováveis até 2026, com foco no hidrogénio verde e energia solar (PS e PSD); programa de descarbonização da indústria com incentivos fiscais de 40% para adoção de tecnologias limpas (PSD); expansão da rede de transportes públicos nas áreas metropolitanas com 100km de novas linhas e tarifa máxima de 30€/mês (PS e BE); reflorestação de 100-150 mil hectares com espécies autóctones resistentes a incêndios e orçamento de 150 milhões (vários partidos); implementação de planos de despoluição dos rios com metas de redução de 70% de poluentes industriais até 2030; criação de 10 novas áreas protegidas marinhas cobrindo 30% da ZEE portuguesa (PS); e investimento na gestão da água com modernização de infraestruturas e redução de perdas em 40% com investimento de 500 milhões (PSD).",
  
  "como os candidatos planeiam abordar questões de habitação?": 
    "As propostas de habitação incluem: construção de 25.000-30.000 fogos públicos a custos acessíveis em 4 anos com investimento de 1,5 mil milhões (PS e BE); incentivos fiscais de 30% para reabilitação de imóveis degradados nos centros históricos (PSD); limitação do alojamento local a 10-15% dos imóveis em zonas de pressão urbanística (PS); programa de apoio ao arrendamento jovem com subsídio direto até 30% do valor da renda para menores de 35 anos, beneficiando 150.000 jovens (PSD); simplificação dos processos de licenciamento urbanístico com prazos máximos de resposta de 60 dias (PSD e IL); imposição de tetos máximos nas rendas em grandes centros urbanos (BE e CDU); isenção de IMT e redução de IMI para primeira habitação própria (IL); e programa nacional de reconversão de edifícios devolutos do Estado com 10.000 fogos até 2027 (PS).",
  
  "que reformas educacionais estão a ser propostas?": 
    "As propostas de reforma educacional incluem: redução do número de alunos por turma para máximo de 20 no ensino básico e 22 no secundário (PS e BE); requalificação de 200 escolas públicas com investimento de 500 milhões em eficiência energética e digitalização (PSD); reforma curricular com reforço das competências digitais, pensamento crítico e educação financeira, visando melhorar em 15% os resultados PISA (vários partidos); valorização da carreira docente com revisão do estatuto, progressões mais rápidas e prémios de desempenho até 20% do salário (PSD); aumento do financiamento ao ensino superior em 0,3-0,5% do PIB nos próximos 4 anos (PS e BE); criação de um programa nacional de 10.000 bolsas de mérito para estudantes universitários (PSD); reforço da ligação universidade-empresa com 15 centros de inovação em universidades públicas e financiamento de 200 milhões (PSD e IL); e aumento do investimento em I&D para 3% do PIB até 2027 com meta de 60% de investimento privado (vários partidos)."
};
