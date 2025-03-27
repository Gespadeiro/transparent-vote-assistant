
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
import { X, Save, Search, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  candidateName: z.string().min(1, "Nome do candidato é obrigatório"),
  party: z.string().min(1, "Nome do partido é obrigatório"),
  summary: z.string().min(1, "Resumo é obrigatório"),
  topics: z.string().min(1, "Pelo menos um tópico é obrigatório"),
  proposals: z.string().min(10, "Propostas detalhadas são obrigatórias"),
});

interface ElectoralPlanFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ElectoralPlanForm: React.FC<ElectoralPlanFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  // Convert topics array to comma-separated string for form
  const defaultValues = {
    candidateName: initialData.candidateName || "",
    party: initialData.party || "",
    summary: initialData.summary || "",
    topics: Array.isArray(initialData.topics) 
      ? initialData.topics.join(", ") 
      : initialData.topics || "",
    proposals: initialData.proposals || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert comma-separated topics back to array
    const formattedData = {
      ...values,
      topics: values.topics.split(",").map(topic => topic.trim()),
    };
    onSave(formattedData);
  };

  const getDefaultPrompt = (candidateName: string, partyName: string) => {
    return `Forneça um resumo das principais propostas e posições políticas para ${candidateName} do partido ${partyName}. Formate a resposta como 4-5 tópicos claros e separados que possam ser adicionados a uma base de dados de planos eleitorais portugueses. Cada tópico deve focar em uma área política diferente. Concentre-se em informações relevantes para o contexto político português.`;
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
        "Defesa de um plano de emergência para o Serviço Nacional de Saúde.",
        "Proposta de reforma fiscal com redução de impostos para a classe média.",
        "Implementação de medidas para combater a crise habitacional.",
        "Plano de investimento em infraestruturas sustentáveis e energia renovável.",
        "Reforço do sistema educativo público."
      ];
      
      // Ajustar os resultados com base no partido, se mencionado
      const partyLower = partyName.toLowerCase();
      if (partyLower.includes("social democrata") || partyLower.includes("psd")) {
        fallbackData = [
          "Defesa da redução fiscal para famílias e empresas para impulsionar o crescimento.",
          "Reforma do SNS com parcerias público-privadas para reduzir listas de espera.",
          "Implementação de incentivos à natalidade e apoio às famílias.",
          "Programa de descentralização e valorização do interior do país.",
          "Modernização da administração pública e redução da burocracia."
        ];
      } else if (partyLower.includes("socialista") || partyLower.includes("ps")) {
        fallbackData = [
          "Reforço do Estado Social e do Serviço Nacional de Saúde.",
          "Política de aumentos graduais do salário mínimo nacional.",
          "Investimento em habitação pública e regulação do mercado imobiliário.",
          "Aposta na transição energética e economia verde.",
          "Defesa do ensino público de qualidade e valorização dos professores."
        ];
      }
      
      setSearchResults(fallbackData);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToProposals = () => {
    if (!selectedResult) {
      toast.error("Por favor, selecione informações para adicionar");
      return;
    }

    const currentProposals = form.getValues("proposals");
    const updatedProposals = currentProposals 
      ? `${currentProposals}\n\n${selectedResult}` 
      : selectedResult;
    
    form.setValue("proposals", updatedProposals, { shouldDirty: true });
    toast.success("Informações adicionadas às propostas");
    setSearchDialogOpen(false);
    setSelectedResult("");
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
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tópicos</FormLabel>
                <FormControl>
                  <Input placeholder="Saúde, Economia, Educação..." {...field} />
                </FormControl>
                <FormDescription>
                  Insira tópicos separados por vírgulas
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
                          Pesquisar Informações do Candidato
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
            <Button type="button" variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save size={16} className="mr-2" />
              Salvar Plano
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Pesquisa de Informações do Candidato</DialogTitle>
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
                    <p className="text-amber-700 text-sm">
                      <AlertTriangle size={16} className="inline-block mr-1" />
                      A utilizar dados pré-definidos devido a limitações da API OpenAI. Os resultados podem não refletir as posições mais recentes.
                    </p>
                  </div>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Filtrar resultados..." />
                    <CommandList>
                      <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
                      <CommandGroup heading="Selecione informações para adicionar">
                        {searchResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => setSelectedResult(result)}
                            className={`flex items-start gap-2 p-2 ${
                              selectedResult === result ? "bg-accent" : ""
                            }`}
                          >
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
              disabled={!selectedResult || isSearching}
              className="gap-1"
            >
              <PlusCircle size={16} />
              Adicionar às Propostas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ElectoralPlanForm;
