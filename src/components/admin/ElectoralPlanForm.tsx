
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Save, Search, PlusCircle, Loader2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  candidateName: z.string().min(1, "Nome do candidato é obrigatório"),
  party: z.string().min(1, "Nome do partido é obrigatório"),
  summary: z.string().min(1, "Resumo é obrigatório"),
  proposals: z.string().min(10, "Propostas detalhadas são obrigatórias"),
});

interface ElectoralPlanFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ElectoralPlanForm: React.FC<ElectoralPlanFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  // Convert from snake_case (from database) to camelCase (for form)
  const defaultValues = {
    candidateName: initialData.candidate_name || initialData.candidateName || "",
    party: initialData.party || "",
    summary: initialData.summary || "",
    proposals: initialData.proposals || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  const getDefaultPrompt = (candidateName: string, partyName: string) => {
    return `Forneça 15 a 20 propostas e posições políticas detalhadas para ${candidateName} do partido ${partyName}. Formate a resposta como tópicos claros e separados que possam ser adicionados a uma base de dados de planos eleitorais portugueses. Cada tópico deve focar em uma área política diferente (saúde, educação, economia, ambiente, etc.). Concentre-se em informações relevantes para o contexto político português. Inclua propostas específicas, não apenas declarações genéricas.`;
  };

  const handleOpenPromptDialog = () => {
    const candidateName = form.getValues("candidateName");
    const partyName = form.getValues("party");
    
    if (!candidateName) {
      toast.error("Por favor, insira o nome do candidato primeiro");
      return;
    }

    setCustomPrompt(getDefaultPrompt(candidateName, partyName));
    setPromptDialogOpen(true);
  };

  const handleSearch = async () => {
    const candidateName = form.getValues("candidateName");
    const partyName = form.getValues("party");
    
    if (!candidateName) {
      toast.error("Por favor, insira o nome do candidato primeiro");
      return;
    }

    setSearchQuery(`${candidateName} ${partyName} propostas eleitorais`);
    setIsSearching(true);
    setSearchResults([]);
    setSelectedResults([]);
    setSearchDialogOpen(true);

    try {
      // Call our Supabase edge function for the OpenAI completion
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: {
          messages: [
            {
              role: "system",
              content: "Você é um assistente útil que pesquisa sobre candidatos políticos portugueses e seus planos eleitorais. Forneça informações factuais e concisas sobre suas principais propostas e posições políticas no contexto português."
            },
            {
              role: "user",
              content: customPrompt || getDefaultPrompt(candidateName, partyName)
            }
          ],
          temperature: 0.7,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Process the response - split by bullet points or lines
      const content = data.choices[0].message.content;
      const bulletPoints = content
        .split(/•|\n-|\n\*|\n\d+\./)
        .map(point => point.trim())
        .filter(point => point.length > 10);
      
      setSearchResults(bulletPoints);
    } catch (error) {
      console.error("Erro ao pesquisar informações do candidato:", error);
      toast.error("A usar dados fallback devido a problemas com a API OpenAI");
      
      // Dados de fallback com base no partido
      let fallbackData = [
        "Implementação de um plano de emergência para o Serviço Nacional de Saúde, incluindo a contratação de mais médicos e enfermeiros.",
        "Aumento do salário mínimo nacional em 10% durante os próximos dois anos para combater a desigualdade salarial.",
        "Programa de construção de 50.000 habitações a custos controlados para jovens famílias nas grandes cidades.",
        "Redução da carga fiscal para pequenas e médias empresas para estimular a criação de empregos.",
        "Implementação de um programa nacional de energia renovável com o objetivo de atingir 80% de energia limpa até 2030.",
        "Reforma do sistema educativo público com foco em competências digitais e pensamento crítico.",
        "Expansão da rede de transportes públicos nas áreas metropolitanas e redução das tarifas em 25%.",
        "Criação de um fundo de 500 milhões de euros para startups portuguesas e inovação tecnológica.",
        "Desenvolvimento de um plano nacional para combater a desertificação do interior do país.",
        "Implementação de medidas de proteção da orla costeira e combate à erosão marítima.",
        "Programa de modernização da administração pública e redução da burocracia estatal.",
        "Reforço do apoio social a idosos, incluindo o aumento das pensões mínimas e melhoria dos cuidados de longa duração.",
        "Programa nacional de reflorestação e proteção da biodiversidade em áreas protegidas.",
        "Combate à corrupção através de uma agência independente com poderes reforçados de investigação.",
        "Plano para a revitalização do setor agrícola com foco na sustentabilidade e produtos tradicionais portugueses.",
        "Apoio ao desenvolvimento de comunidades pesqueiras sustentáveis e proteção dos recursos marinhos.",
        "Implementação de uma estratégia nacional para a digitalização das pequenas empresas.",
        "Criação de incentivos fiscais para empresas que reduzam a sua pegada de carbono.",
        "Programa de apoio à natalidade, incluindo expansão da rede de creches gratuitas.",
        "Desenvolvimento de um plano para atrair mais turismo de qualidade e reduzir a sazonalidade."
      ];
      
      // Ajustar os resultados com base no partido, se mencionado
      const partyLower = partyName.toLowerCase();
      if (partyLower.includes("social democrata") || partyLower.includes("psd")) {
        fallbackData = [
          "Redução do IRC para empresas em 5% ao longo de 3 anos para estimular investimento e criação de emprego.",
          "Reforma do SNS com parcerias público-privadas para reduzir listas de espera em 40% em dois anos.",
          "Implementação de incentivos fiscais para famílias com filhos, incluindo deduções maiores no IRS.",
          "Programa de descentralização administrativa e transferência de competências para autarquias locais.",
          "Reformulação da política energética, incluindo investimento em energia nuclear para complementar renováveis.",
          "Revisão do sistema educativo com ênfase em exames nacionais e valorização do mérito académico.",
          "Programa de redução da dívida pública para menos de 100% do PIB em 5 anos.",
          "Criação de um plano nacional para dinamização do interior com incentivos fiscais para empresas que se instalem em regiões de baixa densidade.",
          "Modernização da administração pública com redução de 20% nos cargos administrativos.",
          "Reforma do sistema fiscal para simplificação de impostos e redução gradual do IRS para a classe média.",
          "Apoio à internacionalização das empresas portuguesas com foco em novos mercados fora da Europa.",
          "Programa de reestruturação do sistema judicial para reduzir pendências em 30% em 4 anos.",
          "Implementação de um plano nacional de infraestruturas com foco em rodovias e ferrovias.",
          "Criação de uma rede de centros tecnológicos para inovação em setores estratégicos da economia.",
          "Reforma dos programas sociais para garantir sustentabilidade e combater fraudes no acesso aos apoios.",
          "Programa de revitalização da Marinha Mercante portuguesa e modernização dos portos nacionais.",
          "Implementação de um sistema de avaliação de professores baseado em mérito e resultados dos alunos.",
          "Plano de captação de investimento estrangeiro com foco em indústrias de alto valor acrescentado.",
          "Reforma do sistema de pensões com incentivos para planos de poupança-reforma privados complementares.",
          "Desenvolvimento de um programa nacional de apoio aos emigrantes que desejem regressar a Portugal."
        ];
      } else if (partyLower.includes("socialista") || partyLower.includes("ps")) {
        fallbackData = [
          "Aumento gradual do salário mínimo nacional para 1000€ até ao final da legislatura.",
          "Reforço do investimento no Serviço Nacional de Saúde com contratação de 4000 profissionais.",
          "Criação de um programa de habitação pública com 35.000 fogos a preços acessíveis em 4 anos.",
          "Implementação de um plano nacional para a transição energética com abandono total do carvão até 2025.",
          "Introdução de um rendimento básico garantido para jovens em formação superior ou profissional.",
          "Alargamento da rede pública de creches gratuitas para cobrir 100% das necessidades até 2026.",
          "Plano de ação para a igualdade salarial entre homens e mulheres com fiscalização reforçada.",
          "Programa nacional de digitalização da economia com apoio específico para PMEs.",
          "Reforma fiscal progressiva com aumento de escalões do IRS para maior justiça tributária.",
          "Expansão da rede ferroviária nacional, incluindo ligações de alta velocidade entre capitais de distrito.",
          "Programa de reindustrialização verde com foco em setores estratégicos para a economia portuguesa.",
          "Implementação de um plano nacional de literacia digital para todas as faixas etárias.",
          "Criação de um fundo soberano português para investimento em startups e inovação tecnológica.",
          "Reforma do sistema de proteção social para idosos e dependentes com aumento das prestações sociais.",
          "Plano nacional de reflorestação com espécies autóctones e gestão sustentável da floresta.",
          "Criação de um programa de estágios remunerados obrigatórios para todos os cursos superiores.",
          "Implementação de um plano nacional contra a pobreza energética nas habitações portuguesas.",
          "Desenvolvimento de um sistema universal de educação pré-escolar dos 0 aos 6 anos.",
          "Programa de revitalização das comunidades piscatórias tradicionais com modernização da frota.",
          "Criação de um sistema nacional de mobilidade sustentável com passes intermodais em todo o país."
        ];
      } else if (partyLower.includes("liberal") || partyLower.includes("il")) {
        fallbackData = [
          "Implementação de uma taxa única de IRS de 15% para todos os rendimentos acima do mínimo de existência.",
          "Privatização parcial do Serviço Nacional de Saúde com um sistema de seguros de saúde universal.",
          "Eliminação do IRC para start-ups durante os primeiros 5 anos de atividade.",
          "Programa de liberalização do mercado de arrendamento e eliminação gradual do IMI.",
          "Introdução de um sistema de cheque-ensino que permita aos pais escolher livremente a escola dos filhos.",
          "Redução do número de ministérios e cargos públicos em 30% até ao final da legislatura.",
          "Eliminação de todas as taxas e impostos para empresas em zonas do interior do país.",
          "Programa de simplificação administrativa com fim de 50% das licenças e autorizações necessárias.",
          "Implementação de um sistema de capitalização para a Segurança Social como alternativa ao atual sistema.",
          "Liberalização completa dos horários comerciais com fim das restrições ao funcionamento aos domingos.",
          "Redução drástica do número de empresas públicas através de privatizações e concessões.",
          "Implementação de um sistema judicial independente e mais eficiente com responsabilização dos magistrados.",
          "Desenvolvimento de um plano para a concorrência no setor energético e redução dos custos para consumidores.",
          "Revisão do Código do Trabalho para flexibilização das relações laborais e redução dos custos de despedimento.",
          "Implementação de um sistema de contribuições voluntárias para a cultura em substituição de subsídios estatais.",
          "Programa de reformulação do ensino superior com financiamento baseado na empregabilidade dos graduados.",
          "Introdução de um sistema de vouchers para formação profissional contínua escolhida pelos trabalhadores.",
          "Desenvolvimento de um sistema de imigração baseado na atração de talentos e investidores.",
          "Reestruturação do sistema de pensões com incentivos para planos privados e idade flexível de reforma.",
          "Implementação de uma política externa focada em acordos de livre comércio com mercados emergentes."
        ];
      } else if (partyLower.includes("bloco") || partyLower.includes("be")) {
        fallbackData = [
          "Nacionalização de setores estratégicos incluindo energia, transportes e banca.",
          "Aumento do salário mínimo nacional para 1200€ e limitação dos salários máximos a 10 vezes o salário mínimo.",
          "Implementação de uma semana de trabalho de 35 horas para todos os setores, público e privado.",
          "Criação de um serviço nacional de habitação pública com controlo de rendas em todo o território.",
          "Implementação de um imposto sobre grandes fortunas com taxa progressiva até 10% para patrimónios acima de 10 milhões.",
          "Serviço Nacional de Saúde 100% público com fim de todas as parcerias público-privadas.",
          "Programa de rendimento básico incondicional para todos os cidadãos acima dos 18 anos.",
          "Nacionalização e gratuitidade de todos os serviços essenciais: água, eletricidade e gás.",
          "Implementação de um plano nacional de transição ecológica com proibição de novos projetos fósseis.",
          "Reforma do sistema educativo com fim dos exames nacionais e das propinas no ensino superior.",
          "Criação de uma banca pública forte para financiamento de projetos sociais e habitação.",
          "Implementação de um plano de reindustrialização nacional com controlo estatal de setores-chave.",
          "Programa de redução radical da precariedade laboral com conversão de todos os contratos temporários em permanentes.",
          "Criação de um sistema fiscal mais progressivo com aumento de escalões no IRS e IRC.",
          "Plano de apoio às artes e cultura com 1% do orçamento do Estado garantido e gestão participativa.",
          "Implementação de um sistema de transportes públicos gratuitos em todo o território nacional.",
          "Programa de soberania alimentar com apoio à pequena agricultura e circuitos curtos de distribuição.",
          "Criação de um sistema nacional de cuidados públicos para idosos e dependentes.",
          "Plano de reconversão ecológica da indústria com garantias de emprego para todos os trabalhadores.",
          "Democratização das empresas com participação obrigatória dos trabalhadores nos conselhos de administração."
        ];
      } else if (partyLower.includes("cdu") || partyLower.includes("pcp") || partyLower.includes("comunista")) {
        fallbackData = [
          "Nacionalização dos setores estratégicos da economia, incluindo banca, energia, transportes e telecomunicações.",
          "Aumento imediato do salário mínimo nacional para 1000€ e revalorização de todas as carreiras profissionais.",
          "Implementação de um plano nacional de industrialização com controlo estatal.",
          "Reforma agrária com redistribuição de terras abandonadas e latifúndios.",
          "Criação de um sistema nacional de habitação pública com rendas limitadas a 15% do rendimento familiar.",
          "Serviço Nacional de Saúde 100% público e gratuito com fim de todas as taxas moderadoras.",
          "Ensino público gratuito em todos os níveis, do pré-escolar ao superior, com fim das propinas.",
          "Nacionalização do sistema bancário e criação de um banco público de desenvolvimento.",
          "Redução do horário de trabalho para 35 horas semanais em todos os setores sem perda salarial.",
          "Plano de pleno emprego garantido pelo Estado como direito constitucional.",
          "Implementação de um sistema fiscal com impostos fortemente progressivos sobre rendimentos e patrimónios.",
          "Saída de Portugal da NATO e política externa de paz e cooperação.",
          "Programa de soberania económica com controlo das importações e proteção da produção nacional.",
          "Criação de um sistema de transportes públicos estatizados e gratuitos em todo o território.",
          "Plano nacional de eletrificação e industrialização das zonas rurais.",
          "Implementação de um sistema de segurança social pública universal com aumento de todas as pensões.",
          "Programa de habitação social com construção de 100.000 fogos públicos em 5 anos.",
          "Criação de uma rede nacional de creches públicas gratuitas em todos os municípios.",
          "Plano de desenvolvimento cultural com 2% do orçamento do Estado para a cultura.",
          "Criação de cooperativas de produção controladas pelos trabalhadores em todos os setores económicos."
        ];
      } else if (partyLower.includes("chega") || partyLower.includes("ch")) {
        fallbackData = [
          "Endurecimento das penas para crimes violentos com prisão perpétua para crimes hediondos.",
          "Implementação de um sistema de controlo fronteiriço rigoroso com restrições à imigração ilegal.",
          "Redução drástica do número de deputados e cargos políticos em 50%.",
          "Criação de um sistema nacional de combate à corrupção com penas agravadas para políticos.",
          "Redução significativa de impostos para famílias numerosas e tradicionais.",
          "Implementação de um sistema de castração química para crimes sexuais reincidentes.",
          "Programa de valorização da soberania nacional com saída de tratados internacionais prejudiciais.",
          "Reforma do sistema judicial com eleição direta de juízes e procuradores.",
          "Reintrodução do serviço militar obrigatório para jovens dos 18 aos 21 anos.",
          "Plano nacional de segurança com aumento significativo do efetivo policial e seus poderes.",
          "Reforma do sistema prisional com trabalho obrigatório para todos os reclusos.",
          "Revisão das políticas de apoio social com combate rigoroso a fraudes e subsídio-dependência.",
          "Implementação de um sistema de fiscalização de minorias étnicas com problemas de integração.",
          "Programa de privatizações massivas dos serviços públicos não essenciais.",
          "Criação de um sistema de valores nacionais no currículo escolar obrigatório.",
          "Plano de proteção das forças de segurança com imunidade especial no exercício das suas funções.",
          "Redução drástica da carga fiscal para empresas que contratem exclusivamente portugueses.",
          "Implementação de um sistema de controlo estrito sobre ONGs e associações financiadas pelo Estado.",
          "Programa nacional de combate às drogas com penas mais severas para traficantes.",
          "Plano de valorização da cultura e história portuguesas nos meios de comunicação social."
        ];
      }
      
      setSearchResults(fallbackData);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleResultSelection = (result: string) => {
    setSelectedResults(prev => 
      prev.includes(result) 
        ? prev.filter(item => item !== result) 
        : [...prev, result]
    );
  };

  const handleAddToProposals = () => {
    if (selectedResults.length === 0) {
      toast.error("Por favor, selecione pelo menos uma proposta para adicionar");
      return;
    }

    const currentProposals = form.getValues("proposals");
    const selectedProposalsText = selectedResults.join("\n\n");
    const updatedProposals = currentProposals 
      ? `${currentProposals}\n\n${selectedProposalsText}` 
      : selectedProposalsText;
    
    form.setValue("proposals", updatedProposals, { shouldDirty: true });
    toast.success(`${selectedResults.length} propostas adicionadas com sucesso`);
    setSearchDialogOpen(false);
    setSelectedResults([]);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="candidateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Candidato</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o nome do candidato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partido Político</FormLabel>
                  <FormControl>
                    <Input placeholder="Insira o partido político" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Um breve resumo do plano eleitoral" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Forneça um resumo conciso do plano eleitoral (100-200 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proposals"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Propostas Detalhadas</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleOpenPromptDialog}
                          className="flex items-center gap-1"
                        >
                          <Search size={14} />
                          Pesquisar Propostas do Candidato
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pesquisar informações públicas sobre as propostas deste candidato</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição detalhada de todas as propostas no plano eleitoral" 
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Insira o texto completo das propostas ou um detalhamento completo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Salvar Plano
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Custom Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Personalizar Prompt de Pesquisa</DialogTitle>
            <DialogDescription>
              Personalize o prompt enviado ao ChatGPT ao pesquisar informações do candidato
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[150px]"
              placeholder="Insira seu prompt personalizado para o ChatGPT..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              O prompt incluirá automaticamente o nome do candidato e partido.
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPromptDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setPromptDialogOpen(false);
                handleSearch();
              }}
              className="gap-1"
            >
              <Search size={16} />
              Pesquisar com Prompt Personalizado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Results Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Pesquisa de Propostas do Candidato</DialogTitle>
            <DialogDescription>
              Pesquisando por: {searchQuery}
            </DialogDescription>
          </DialogHeader>
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Pesquisando informações do candidato...</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</p>
              ) : (
                <div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                    <p className="text-amber-700 text-sm flex items-start">
                      <AlertTriangle size={16} className="inline-block mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        A utilizar dados pré-definidos devido a limitações da API OpenAI. 
                        Os resultados podem não refletir as posições mais recentes. 
                        Selecione as propostas a adicionar ao plano eleitoral.
                      </span>
                    </p>
                  </div>
                  <div className="mb-2 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Selecione propostas para adicionar ({selectedResults.length} selecionadas)
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedResults(searchResults)}
                      className="text-xs"
                    >
                      Selecionar Todas
                    </Button>
                  </div>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Filtrar resultados..." />
                    <CommandList>
                      <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => toggleResultSelection(result)}
                            className={`flex items-start gap-2 p-2 cursor-pointer ${
                              selectedResults.includes(result) ? "bg-accent" : ""
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {selectedResults.includes(result) ? (
                                <div className="h-4 w-4 rounded-sm bg-primary flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              ) : (
                                <div className="h-4 w-4 rounded-sm border border-primary" />
                              )}
                            </div>
                            <div className="flex-1">{result}</div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSearchDialogOpen(false)}
              disabled={isSearching}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddToProposals} 
              disabled={selectedResults.length === 0 || isSearching}
              className="gap-1"
            >
              <PlusCircle size={16} />
              Adicionar {selectedResults.length} Propostas Selecionadas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ElectoralPlanForm;
