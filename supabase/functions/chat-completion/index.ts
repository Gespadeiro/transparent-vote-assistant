
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback respostas pré-definidas para candidatos portugueses
const fallbackResponses = {
  "geral": [
    "Defesa de um plano de emergência para o Serviço Nacional de Saúde, incluindo redução das listas de espera e contratação de mais profissionais.",
    "Proposta de reforma fiscal com redução de impostos para a classe média e pequenas empresas para estimular a economia.",
    "Implementação de medidas para combater a crise habitacional, incluindo construção de habitação pública e regulação das rendas.",
    "Plano de investimento em infraestruturas sustentáveis e energia renovável para cumprir metas climáticas.",
    "Reforço do sistema educativo público, com foco na digitalização e modernização das escolas."
  ],
  "psd": [
    "Defesa da redução fiscal para famílias e empresas como forma de impulsionar o crescimento económico e a criação de emprego.",
    "Plano de reforma do Serviço Nacional de Saúde, promovendo parcerias público-privadas para reduzir as listas de espera.",
    "Implementação de medidas para aumentar a natalidade através de incentivos fiscais e apoio às famílias.",
    "Programa de descentralização administrativa e valorização do interior do país.",
    "Modernização da administração pública com ênfase na digitalização e redução da burocracia."
  ],
  "ps": [
    "Reforço do Estado Social e do Serviço Nacional de Saúde como pilar fundamental da sociedade portuguesa.",
    "Continuação da política de aumentos graduais do salário mínimo nacional para combater desigualdades.",
    "Investimento em habitação pública e regulação do mercado imobiliário para garantir acesso à habitação.",
    "Aposta na transição energética e economia verde como motores de crescimento sustentável.",
    "Defesa do ensino público de qualidade, com reforço de recursos e valorização dos professores."
  ],
  "be": [
    "Nacionalização de serviços essenciais e rejeição de privatizações em setores estratégicos.",
    "Aumento significativo do salário mínimo nacional e reforço dos direitos laborais.",
    "Criação de uma rede pública de creches gratuitas e investimento na educação pública.",
    "Implementação de políticas ambiciosas de combate às alterações climáticas e transição energética justa.",
    "Defesa de um plano nacional de habitação pública e controlo efetivo das rendas."
  ],
  "cdu": [
    "Valorização dos serviços públicos e reversão de privatizações em setores estratégicos.",
    "Aumento significativo dos salários e pensões para melhorar as condições de vida dos trabalhadores.",
    "Defesa da produção nacional e reindustrialização do país como forma de garantir a soberania económica.",
    "Implementação de políticas de apoio à agricultura familiar e às pequenas e médias empresas.",
    "Investimento público em habitação e controlo das rendas para garantir o direito à habitação."
  ],
  "il": [
    "Simplificação e redução significativa da carga fiscal para impulsionar o crescimento económico.",
    "Liberalização do mercado de trabalho para estimular a criação de emprego e a competitividade.",
    "Reforma do sistema de saúde, promovendo a liberdade de escolha e a concorrência entre prestadores.",
    "Diminuição da intervenção do Estado na economia, privilegiando a iniciativa privada e o empreendedorismo.",
    "Modernização e redução da burocracia estatal, apostando na digitalização e simplificação de processos."
  ],
  "chega": [
    "Combate à corrupção com penalizações mais severas e maior transparência na administração pública.",
    "Reforço das políticas de segurança e autoridade do Estado, com mais recursos para as forças policiais.",
    "Reforma profunda do sistema judicial para garantir maior celeridade e eficácia na aplicação da justiça.",
    "Controlo mais rigoroso da imigração ilegal e políticas de integração mais exigentes.",
    "Redução da carga fiscal para famílias e empresas como estímulo à economia."
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { messages, temperature = 0.7 } = await req.json();

    console.log(`Processando pedido de chat completion com ${messages.length} mensagens`);

    // Make sure we have an OpenAI API key
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY não está definida");
    }

    // Tenta identificar candidato/partido nas mensagens
    let fallbackContent: string[] = fallbackResponses.geral;
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Verifica se algum partido está mencionado na mensagem
    if (lastMessage.includes("psd") || lastMessage.includes("social democrata")) {
      fallbackContent = fallbackResponses.psd;
    } else if (lastMessage.includes("ps") || lastMessage.includes("socialista")) {
      fallbackContent = fallbackResponses.ps;
    } else if (lastMessage.includes("be") || lastMessage.includes("bloco")) {
      fallbackContent = fallbackResponses.be;
    } else if (lastMessage.includes("cdu") || lastMessage.includes("comunista") || lastMessage.includes("pcp")) {
      fallbackContent = fallbackResponses.cdu;
    } else if (lastMessage.includes("il") || lastMessage.includes("iniciativa liberal")) {
      fallbackContent = fallbackResponses.il;
    } else if (lastMessage.includes("chega")) {
      fallbackContent = fallbackResponses.chega;
    }

    try {
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
        console.error("Erro na API OpenAI:", JSON.stringify(error, null, 2));
        throw new Error(`Erro na API OpenAI: ${error.error?.message || "Erro desconhecido"}`);
      }

      // Parse the response
      const data = await response.json();

      // Return the response
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (openaiError) {
      console.error("Erro ao chamar a API OpenAI, usando resposta de fallback:", openaiError);
      
      // Criando uma resposta no formato que o cliente espera
      const fallbackResponse = {
        id: "fallback-response",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "fallback-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "• " + fallbackContent.join("\n\n• ")
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Erro na função chat-completion:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: true,
      message: "Estamos a usar respostas pré-definidas devido a problemas com o serviço de IA."
    }), {
      status: 200, // Mudando para 200 para garantir que o cliente receba a resposta
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
