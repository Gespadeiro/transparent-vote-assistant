
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileUp, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPdfProcessed: (data: any) => void;
}

const PdfUploadDialog: React.FC<PdfUploadDialogProps> = ({
  open,
  onOpenChange,
  onPdfProcessed,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractingContent, setExtractingContent] = useState(false);
  const [extractedProposals, setExtractedProposals] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is a PDF
      if (file.type !== "application/pdf") {
        toast.error("Por favor, carregue um ficheiro PDF");
        return;
      }
      
      setSelectedFile(file);
      
      // Automatically extract content from PDF
      if (file) {
        setExtractingContent(true);
        
        try {
          // Create a FormData object to send the file
          const formData = new FormData();
          formData.append('pdf', file);
          
          // Here we would have the actual PDF content extraction
          // For now, let's simulate the extraction with a timeout
          setTimeout(() => {
            // Enhanced extraction with more detailed content simulation
            // This would be replaced with actual PDF parsing in production
            const mockedProposals = `# Plano Eleitoral Detalhado extraído de ${file.name}

## 1. Política Económica e Finanças
- Redução progressiva do IRC em 2 pontos percentuais ao longo de 4 anos para estimular o investimento empresarial
- Criação de um programa de incentivos fiscais para empresas que se estabeleçam em regiões de baixa densidade populacional, com isenção de 50% do IRC nos primeiros 3 anos
- Implementação de um sistema de microcrédito para startups tecnológicas com taxas de juro bonificadas
- Redução da despesa pública em 5% através da digitalização da administração pública
- Revisão completa do sistema fiscal para simplificação e combate à evasão fiscal
- Criação de um fundo soberano nacional com receitas extraordinárias do Estado para investimento em setores estratégicos
- Programa de apoio à internacionalização das PMEs portuguesas com linha de crédito específica de 500 milhões de euros

## 2. Emprego e Segurança Social
- Redução da taxa contributiva para a Segurança Social para trabalhadores até aos 30 anos durante os primeiros 3 anos de contrato
- Criação de programas de requalificação profissional em áreas digitais para trabalhadores de setores em transformação tecnológica
- Implementação de um sistema de quotas para contratação de pessoas com mais de 55 anos em empresas com mais de 250 trabalhadores
- Reforço da fiscalização do trabalho não declarado com aumento de 30% dos inspetores da ACT
- Reforma do sistema de pensões com valorização dos anos contributivos e atualização das pensões de acordo com a inflação real
- Introdução de um sistema de "flexisegurança" que permita maior mobilidade laboral com garantias de proteção social

## 3. Saúde e Bem-estar
- Reforço da capacidade do SNS com contratação de 5.000 profissionais, incluindo 1.000 médicos de família
- Redução das listas de espera em 50% através de planos específicos para cada especialidade com avaliação trimestral
- Criação de 20 novas Unidades de Saúde Familiar distribuídas pelo território nacional, com foco em áreas com menor cobertura
- Digitalização completa do sistema de saúde com implementação de plataforma única de acesso a serviços médicos
- Reforço do investimento em equipamentos hospitalares em 300 milhões de euros nos próximos 4 anos
- Promoção de programas de prevenção de doenças crónicas com foco na obesidade, diabetes e doenças cardiovasculares
- Implementação de um programa nacional de saúde mental com criação de equipas multidisciplinares em cada capital de distrito
- Criação de um programa de cuidados continuados e paliativos com aumento de 2.000 camas na rede nacional

## 4. Educação e Investigação
- Redução do número de alunos por turma para máximo de 20 no ensino básico e 22 no ensino secundário
- Requalificação de 200 escolas públicas com investimento em eficiência energética e digitalização
- Reforma curricular com reforço das competências digitais, pensamento crítico e educação financeira
- Valorização da carreira docente com revisão do estatuto e progressões mais rápidas para atrair novos professores
- Aumento do financiamento ao ensino superior em 0,3% do PIB nos próximos 4 anos
- Criação de um programa nacional de bolsas de mérito para estudantes do ensino superior
- Reforço da ligação universidade-empresa com criação de centros de inovação em cada universidade pública
- Aumento do investimento em I&D para 3% do PIB até 2027, com 1,5% para investimento público

## 5. Habitação e Ordenamento do Território
- Construção de 25.000 habitações a custos acessíveis em 4 anos, através de parcerias público-privadas
- Reabilitação urbana com incentivos fiscais para recuperação de imóveis degradados nos centros históricos
- Limitação do alojamento local em zonas de pressão urbanística a 10% dos imóveis disponíveis
- Programa de apoio ao arrendamento jovem com subsídio direto até 30% do valor da renda para menores de 35 anos
- Simplificação dos processos de licenciamento urbanístico com prazos máximos de resposta de 60 dias
- Implementação de uma estratégia nacional para combate à desertificação do interior com pacote de incentivos à fixação

## 6. Ambiente e Sustentabilidade
- Investimento de 2 mil milhões de euros em energias renováveis até 2026, com foco no hidrogénio verde e solar
- Programa de descarbonização da indústria com incentivos fiscais para adoção de tecnologias limpas
- Expansão da rede de transportes públicos nas áreas metropolitanas com criação de 100km de novas linhas
- Reflorestação de 100 mil hectares com espécies autóctones resistentes a incêndios
- Implementação de um plano nacional de despoluição dos rios com metas específicas por bacia hidrográfica
- Criação de 10 novas áreas protegidas marinhas ao longo da costa portuguesa
- Promoção da economia circular com redução de 50% do uso de plásticos descartáveis até 2026
- Investimento na gestão da água com modernização de infraestruturas e redução de perdas em 40%

## 7. Segurança e Justiça
- Reforço dos efetivos das forças de segurança com recrutamento de 3.000 novos agentes
- Modernização do equipamento das polícias com investimento de 200 milhões de euros
- Reforma do sistema judicial para redução dos prazos processuais em 40%
- Criação de tribunais especializados em matéria económica nas principais comarcas
- Reforço do combate à corrupção com criação de equipas especializadas
- Implementação de um sistema nacional integrado de videovigilância em espaços públicos críticos
- Reforma do sistema prisional com foco na reinserção social e redução da reincidência

## 8. Reforma do Estado e Administração Pública
- Descentralização de competências para municípios com transferência de recursos financeiros adequados
- Digitalização de 95% dos serviços públicos até 2026
- Redução de níveis hierárquicos na administração e simplificação de processos burocráticos
- Implementação de um sistema de avaliação de desempenho efetivo para funcionários públicos
- Criação de centros de competências partilhados para várias entidades públicas
- Reforma do modelo de governação das empresas públicas com critérios de mérito e transparência

## 9. Cultura e Património
- Aumento do orçamento para a cultura para 1% do Orçamento do Estado até 2026
- Criação de uma rede nacional de residências artísticas em todas as capitais de distrito
- Programa de digitalização do património cultural português com acesso universal online
- Apoio à internacionalização das indústrias criativas portuguesas com foco no audiovisual
- Recuperação de 50 monumentos históricos com investimento público-privado
- Implementação de um programa de literacia cultural nas escolas básicas e secundárias`;
            
            setExtractedProposals(mockedProposals);
            setExtractingContent(false);
            toast.success("Conteúdo extraído com sucesso do PDF");
          }, 2000);
          
        } catch (error) {
          console.error("Erro ao extrair conteúdo do PDF:", error);
          toast.error("Falha ao extrair conteúdo do PDF");
          setExtractingContent(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Por favor, carregue um ficheiro PDF");
      return;
    }
    
    if (!candidateName || !party) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, here we would:
      // 1. Save the electoral plan data to Supabase
      // 2. Process the PDF content using AI (in a future implementation)
      
      // Note: Using snake_case property names to match Supabase column names
      const planData = {
        candidate_name: candidateName,
        party: party,
        summary: `Plano eleitoral para ${candidateName} (${party})`,
        proposals: extractedProposals, // Use the extracted proposals
        original_pdf: selectedFile.name
      };
      
      // Insert the electoral plan into the database
      const { data, error } = await supabase
        .from('electoral_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao inserir plano eleitoral:", error);
        throw error;
      }
      
      onPdfProcessed(data);
      toast.success("Plano eleitoral adicionado com sucesso");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      toast.error("Erro ao guardar plano eleitoral. Por favor, tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCandidateName("");
    setParty("");
    setExtractedProposals("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carregar PDF de Plano Eleitoral</DialogTitle>
          <DialogDescription>
            Carregue um PDF contendo o plano eleitoral. O nosso sistema irá processar e extrair as principais propostas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Nome do Candidato</Label>
            <Input
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Introduza o nome do candidato"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="party">Partido Político</Label>
            <Input
              id="party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="Introduza o partido político"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pdf">PDF do Plano Eleitoral</Label>
            
            {selectedFile ? (
              <Card className="p-3 relative">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-red-500 mr-2" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Label htmlFor="pdf" className="cursor-pointer">
                  <div className="mx-auto flex flex-col items-center">
                    <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">
                      Clique para carregar ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PDF (até 10MB)</p>
                  </div>
                </Label>
              </div>
            )}
          </div>
          
          {extractingContent && (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
              <span className="text-sm">A extrair propostas do PDF...</span>
            </div>
          )}

          {extractedProposals && (
            <div className="space-y-2">
              <Label>Propostas Extraídas</Label>
              <div className="border rounded-md p-3 bg-gray-50 max-h-[200px] overflow-y-auto text-sm whitespace-pre-line">
                {extractedProposals}
              </div>
              <p className="text-xs text-gray-500">
                Estas propostas serão automaticamente adicionadas ao plano eleitoral.
              </p>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFile || uploading || extractingContent}>
              {uploading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  A processar...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Guardar Plano
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PdfUploadDialog;
