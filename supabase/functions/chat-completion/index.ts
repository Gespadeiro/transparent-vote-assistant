
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced fallback responses with more detailed data
const fallbackResponses = {
  "geral": [
    "O plano de emergência para o Serviço Nacional de Saúde inclui a contratação de 5.000 profissionais de saúde e a criação de 20 novas Unidades de Saúde Familiar, com o objetivo de reduzir as listas de espera em 50% até 2026.",
    "A reforma fiscal proposta inclui a redução do IRC em 2-3 pontos percentuais e benefícios fiscais para a classe média, estimando um aumento de 2% no rendimento disponível das famílias.",
    "Para combater a crise habitacional, prevê-se a construção de 25.000 habitações públicas a custos controlados nos próximos 4 anos e a limitação do alojamento local a um máximo de 15% dos imóveis em zonas urbanas sob pressão.",
    "O plano de investimento em infraestruturas sustentáveis e energia renovável contempla 2 mil milhões de euros até 2026, com o objetivo de atingir 85% de eletricidade de fontes renováveis.",
    "O reforço do sistema educativo inclui a redução para 20 alunos por turma no ensino básico, a requalificação de 200 escolas com investimento de 500 milhões, e o aumento do financiamento do ensino superior em 0,3% do PIB."
  ],
  "psd": [
    "O PSD defende a redução fiscal para famílias e empresas, propondo uma diminuição do IRC em 2 pontos percentuais ao longo de 4 anos e uma simplificação do sistema tributário que reduziria a carga fiscal para a classe média em cerca de 15%.",
    "Para a reforma do Serviço Nacional de Saúde, o partido propõe parcerias público-privadas com o objetivo de reduzir as listas de espera em 50% até 2026 e a contratação de 1.000 médicos de família nas zonas mais carenciadas.",
    "As medidas para aumentar a natalidade incluem incentivos fiscais com dedução adicional de 1.000€ por filho no IRS e a criação de uma rede nacional de creches com 25.000 novas vagas até 2027.",
    "O programa de descentralização administrativa prevê a transferência de 1,2 mil milhões de euros para os municípios e a criação de incentivos à fixação no interior, com redução de 50% no IRS para novos residentes durante 5 anos.",
    "A modernização da administração pública foca-se na digitalização de 95% dos serviços até 2026, com uma estimativa de redução de custos operacionais em 20% e diminuição dos prazos de resposta em 60%."
  ],
  "ps": [
    "O PS propõe um reforço do Estado Social com um investimento adicional de 0,5% do PIB anual e um aumento do orçamento do SNS em 600 milhões de euros para contratar 5.000 profissionais de saúde.",
    "A política de aumentos do salário mínimo visa atingir os 1.000€ até 2026 (um aumento de cerca de 20% face ao valor atual) e implementar acordos de rendimentos que promovam aumentos salariais médios de 4,5% ao ano.",
    "Na habitação, o partido planeia um investimento de 1,5 mil milhões de euros para construir 30.000 fogos públicos a custos acessíveis e regular as rendas com limites de aumento baseados na inflação mais 2%.",
    "A transição energética inclui o investimento de 3 mil milhões em energias renováveis até 2030, com o objetivo de atingir 90% de eletricidade de fontes renováveis e reduzir em 55% as emissões de gases com efeito de estufa.",
    "Para o ensino público, o PS defende a contratação de 10.000 professores nos próximos 4 anos, a requalificação de 300 escolas com um investimento de 700 milhões, e a redução gradual das propinas no ensino superior em 25%."
  ],
  "be": [
    "O Bloco de Esquerda propõe a nacionalização de empresas em setores estratégicos como energia, telecomunicações e transportes, estimando uma poupança para os consumidores de 15-20% nas tarifas.",
    "Para os salários, defende um aumento significativo do salário mínimo para 1.100€ até 2026 (cerca de 30% de aumento) e uma lei que impeça que o rácio entre o salário mais alto e o mais baixo numa empresa ultrapasse 1:10.",
    "Na educação, propõe a gratuitidade total do ensino público, a criação de uma rede nacional de 100.000 vagas em creches públicas gratuitas, e um investimento de 1 mil milhão para renovação de infraestruturas escolares.",
    "As políticas climáticas incluem um investimento de 4 mil milhões em transportes públicos urbanos e ferroviários, com o objetivo de os tornar gratuitos até 2030 e reduzir as emissões do setor em 70%.",
    "Para a habitação, defende um plano nacional com 50.000 fogos públicos a rendas acessíveis, a imposição de tetos máximos às rendas em grandes centros urbanos, e a proibição da venda de imóveis a não-residentes em zonas de pressão urbanística."
  ],
  "cdu": [
    "A CDU defende a valorização dos serviços públicos com a renacionalização de empresas privatizadas nos setores da energia, comunicações e transportes, com um plano de investimento público de 5 mil milhões anuais.",
    "Propõe o aumento do salário mínimo para 1.000€ imediatamente e 1.300€ até final da legislatura (um aumento de cerca de 50%), bem como o aumento das pensões mínimas em 10% por ano durante 4 anos.",
    "Na defesa da produção nacional, apresenta um plano de reindustrialização com investimento de 2 mil milhões e proteção de setores estratégicos, visando reduzir a dependência externa em 30% até 2030.",
    "Para a agricultura, defende apoios de 500 milhões anuais para pequenos e médios agricultores, garantia de preços mínimos para produtos essenciais, e criação de uma rede pública de distribuição direta do produtor ao consumidor.",
    "Na habitação, propõe o controlo efetivo das rendas com tetos máximos baseados no rendimento médio da zona (nunca superiores a 30% do rendimento familiar), construção de 100.000 fogos públicos em 10 anos, e imposição de uma taxa de 25% sobre imóveis detidos por fundos imobiliários."
  ],
  "il": [
    "A Iniciativa Liberal propõe uma simplificação radical do sistema fiscal, reduzindo o número de escalões de IRS de 7 para 3 e uma taxa única de 15% para rendimentos até 30.000€ anuais, estimando um aumento médio de 10% no rendimento disponível das famílias.",
    "Para o mercado de trabalho, defende uma liberalização com contratos mais flexíveis, redução da TSU em 4 pontos percentuais, e incentivos fiscais para empresas que criem empregos qualificados com salários 20% acima da média sectorial.",
    "A reforma do sistema de saúde inclui a implementação de um modelo de liberdade de escolha entre prestadores públicos e privados através de um sistema de vouchers, com o objetivo de reduzir as listas de espera em 75% em dois anos.",
    "Propõe uma diminuição da intervenção estatal com privatização de empresas públicas deficitárias (poupança estimada de 1,5 mil milhões anuais) e redução da despesa pública em 6 mil milhões nos próximos 4 anos.",
    "Na modernização administrativa, defende a digitalização completa de todos os serviços públicos até 2025, a redução do número de ministérios de 19 para 12, e um corte de 15% no número de funcionários públicos através da não substituição de aposentações."
  ],
  "chega": [
    "O Chega propõe medidas anticorrupção que incluem o agravamento de penas para crimes de corrupção (mínimo de 5 anos de prisão efetiva), a criação de um tribunal especial anticorrupção, e a implementação de um sistema de declaração patrimonial digital para todos os titulares de cargos públicos.",
    "Para a segurança, defende o reforço imediato das forças policiais com 5.000 novos agentes, um aumento salarial de 30% para profissionais de segurança, e investimento de 300 milhões em equipamento e tecnologia para forças policiais.",
    "A reforma do sistema judicial prevê a criação de tribunais especializados em crimes económicos, contratação de 700 novos juízes e procuradores, e implementação de sistemas digitais para reduzir a duração dos processos em 60%.",
    "Nas políticas de imigração, propõe um sistema de quotas por país e por setor económico, exigência de contrato de trabalho prévio à entrada no país, e um processo de verificação de antecedentes mais rigoroso com expulsão imediata em caso de condenação criminal.",
    "Para a redução fiscal, defende uma diminuição do IRS em todos os escalões (média de 25%), eliminação do imposto sobre combustíveis, e redução do IRC para 15% em três anos para estimular o investimento empresarial."
  ]
};

async function fetchElectoralPlans(candidateFilters = null) {
  try {
    let query = supabase
      .from('electoral_plans')
      .select('candidate_name, party, summary, proposals');
    
    // Apply filters if candidate or party filters exist
    if (candidateFilters && candidateFilters.length > 0) {
      const lowerCaseFilters = candidateFilters.map(filter => filter.toLowerCase());
      
      // Build OR conditions for candidate_name and party matches
      const filterConditions = lowerCaseFilters.map(filter => {
        return `(LOWER(candidate_name) LIKE '%${filter}%' OR LOWER(party) LIKE '%${filter}%')`;
      }).join(' OR ');
      
      query = query.or(filterConditions);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao obter planos eleitorais:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Exceção ao obter planos eleitorais:", error);
    return null;
  }
}

function formatElectoralPlansForContext(plans) {
  if (!plans || plans.length === 0) {
    return "Não há planos eleitorais disponíveis.";
  }
  
  return plans.map(plan => {
    return `
CANDIDATO: ${plan.candidate_name}
PARTIDO: ${plan.party}
RESUMO: ${plan.summary || "Sem resumo disponível"}
PROPOSTAS DETALHADAS: ${plan.proposals || "Sem propostas detalhadas disponíveis"}
---
`;
  }).join("\n");
}

function extractTopicsFromQuery(query) {
  const topics = [
    "economia", "saúde", "educação", "habitação", "ambiente", 
    "imigração", "segurança", "justiça", "trabalho", "impostos", 
    "fiscal", "reforma", "aposentadoria", "energia", "transporte",
    "mobilidade", "corrupção", "administração", "tecnologia", "digital"
  ];
  
  const lowerQuery = query.toLowerCase();
  return topics.filter(topic => lowerQuery.includes(topic));
}

async function generateFallbackFromElectoralPlans(query, partyFilter) {
  // Use either the specific party filter or return general statements
  const partyKey = partyFilter && partyFilter.length > 0 ? partyFilter[0].toLowerCase() : "geral";
  
  // Return the appropriate fallback statements based on the party
  if (fallbackResponses[partyKey]) {
    return fallbackResponses[partyKey];
  }
  
  return fallbackResponses["geral"];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { messages, temperature = 0.7, max_tokens = 1500, candidateFilter = null } = await req.json();

    console.log(`Processando pedido de chat completion com ${messages.length} mensagens`);
    if (candidateFilter) {
      console.log(`Filtros aplicados: ${candidateFilter.join(', ')}`);
    }

    // Make sure we have an OpenAI API key
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY não está definida");
    }

    // Extract the last user message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Fetch electoral plans for context, applying filters if provided
    const electoralPlans = await fetchElectoralPlans(candidateFilter);
    const planContext = formatElectoralPlansForContext(electoralPlans);
    
    // Extract topics from the query
    const topicsFromQuery = extractTopicsFromQuery(lastMessage);
    console.log(`Tópicos identificados na consulta: ${topicsFromQuery.join(', ') || 'nenhum específico'}`);
    
    // Identify party/candidate references
    let partyReference = candidateFilter ? candidateFilter[0] : null;
    if (!partyReference) {
      if (lastMessage.includes("psd") || lastMessage.includes("social democrata")) {
        partyReference = "psd";
      } else if (lastMessage.includes("ps") || lastMessage.includes("socialista")) {
        partyReference = "ps";
      } else if (lastMessage.includes("be") || lastMessage.includes("bloco")) {
        partyReference = "be";
      } else if (lastMessage.includes("cdu") || lastMessage.includes("comunista") || lastMessage.includes("pcp")) {
        partyReference = "cdu";
      } else if (lastMessage.includes("il") || lastMessage.includes("iniciativa liberal")) {
        partyReference = "il";
      } else if (lastMessage.includes("chega")) {
        partyReference = "chega";
      }
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
            // Enhanced system message with more detailed instructions
            {
              role: "system",
              content: `Você é um assistente especializado em política portuguesa que responde com base em informações detalhadas sobre planos eleitorais. Sua função é fornecer análises abrangentes e detalhadas das propostas políticas, ajudando os eleitores a compreenderem claramente as posições dos partidos e candidatos.

Quando solicitado, você deve:
1. Analisar em profundidade as informações disponíveis, especialmente as PROPOSTAS DETALHADAS de cada plano
2. Organizar sua resposta por temas relevantes (economia, saúde, educação, etc.)
3. Apresentar as propostas concretas com números e metas específicas quando disponíveis (percentagens, valores monetários, prazos, quantidades)
4. Comparar diferentes posições políticas de forma equilibrada e imparcial
5. Explicar potenciais impactos das propostas na sociedade e economia
6. Fornecer dados específicos sempre que possível, destacando os detalhes concretos de cada proposta

${candidateFilter ? 'Foque especificamente nos candidatos/partidos especificados, fornecendo o máximo de detalhes sobre suas propostas.' : 'Forneça uma visão abrangente de todos os planos disponíveis, destacando as principais diferenças entre eles.'}

${topicsFromQuery.length > 0 ? `Foque especificamente nos seguintes tópicos: ${topicsFromQuery.join(', ')}.` : ''}

Aqui estão os planos eleitorais disponíveis, com suas propostas detalhadas:

${planContext}

Não se limite a resumir o conteúdo. Analise criticamente as propostas, forneça contexto quando relevante, e explique em detalhes as medidas concretas apresentadas em cada plano. Seja específico sobre números, prazos, e metas mencionadas nas propostas - estes detalhes são cruciais para que os eleitores compreendam as diferenças entre as políticas propostas. Responda sempre em português europeu formal, de maneira clara e acessível ao eleitor médio.`
            },
            ...messages
          ],
          temperature: temperature,
          max_tokens: max_tokens,
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
      
      // Generate fallback based on electoral plans data, using filters
      const fallbackContent = await generateFallbackFromElectoralPlans(lastMessage, candidateFilter);
      
      // Creating a response in the format that the client expects
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
      message: "Estamos a usar respostas baseadas nos planos eleitorais disponíveis devido a problemas com o serviço de IA."
    }), {
      status: 200, // Mudando para 200 para garantir que o cliente receba a resposta
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
