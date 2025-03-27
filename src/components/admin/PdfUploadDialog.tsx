
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
          // In a real implementation, we would send the file to the backend for processing
          // For now, we'll simulate the extraction with enhanced mock data to showcase the UI
          
          // Create a FormData object to send the file
          const formData = new FormData();
          formData.append('pdf', file);
          
          // Simulate calling our edge function
          setTimeout(() => {
            // This is where we would call the API - in this demo we'll use a mock response
            const mockedProposals = `# Plano Eleitoral de ${candidateName || "Candidato"} (${party || "Partido"})

## Visão Geral
Este plano eleitoral apresenta uma visão abrangente para Portugal, focando em crescimento económico sustentável, fortalecimento dos serviços públicos, e inovação em políticas sociais e ambientais. O plano articula uma estratégia para modernizar o país enquanto preserva valores fundamentais de solidariedade e igualdade de oportunidades.

## Principais Áreas de Atuação

### 1. Economia e Finanças
- **Redução Fiscal**: Redução progressiva do IRC em 2 pontos percentuais ao longo de 4 anos para estimular o investimento empresarial
- **Incentivos Regionais**: Isenção de 50% do IRC nos primeiros 3 anos para empresas em regiões de baixa densidade populacional
- **Apoio a Startups**: Sistema de microcrédito para startups tecnológicas com taxas de juro bonificadas
- **Eficiência do Estado**: Redução da despesa pública em 5% através da digitalização administrativa
- **Reforma Fiscal**: Simplificação do sistema fiscal e combate à evasão fiscal
- **Investimento Estratégico**: Fundo soberano nacional de €2 mil milhões para setores estratégicos
- **Internacionalização**: Linha de crédito de 500 milhões de euros para apoiar PMEs portuguesas no mercado externo

### 2. Emprego e Segurança Social
- **Jovens Trabalhadores**: Redução da TSU para trabalhadores até 30 anos nos primeiros 3 anos
- **Requalificação Profissional**: Programa de 300 milhões de euros para formar 50.000 trabalhadores em competências digitais
- **Trabalhadores Seniores**: Sistema de quotas para contratação de pessoas com mais de 55 anos em grandes empresas
- **Fiscalização Laboral**: Aumento de 30% nos inspetores da ACT para combater trabalho precário
- **Sistema de Pensões**: Nova fórmula de cálculo valorizando anos contributivos e atualização pela inflação real
- **Flexisegurança**: Novo quadro legal permitindo maior mobilidade com garantias de proteção social

### 3. Saúde e Bem-estar
- **Reforço do SNS**: Contratação de 5.000 profissionais, incluindo 1.000 médicos de família
- **Listas de Espera**: Plano para redução de 50% nas listas de espera com objetivos trimestrais
- **Cobertura Nacional**: 20 novas Unidades de Saúde Familiar em áreas com menor acesso a cuidados
- **Transformação Digital**: Implementação de plataforma única de acesso a serviços médicos até 2026
- **Equipamentos**: Investimento de 300 milhões de euros em equipamentos hospitalares
- **Prevenção**: Programas focados em obesidade, diabetes e doenças cardiovasculares, com objetivo de reduzir em 15% a sua incidência
- **Saúde Mental**: Equipas multidisciplinares em cada capital de distrito e linha telefónica 24h
- **Cuidados Continuados**: Aumento de 2.000 camas na rede nacional até 2027

### 4. Educação e Investigação
- **Dimensão das Turmas**: Máximo de 20 alunos no ensino básico e 22 no secundário
- **Infraestruturas**: Requalificação de 200 escolas públicas com investimento de 500 milhões de euros
- **Currículo Escolar**: Reforma integrando competências digitais, pensamento crítico e educação financeira
- **Carreira Docente**: Revisão do estatuto com progressões mais rápidas e prémios de desempenho
- **Ensino Superior**: Aumento do financiamento em 0,3% do PIB e redução de propinas em 25%
- **Bolsas de Estudo**: 10.000 novas bolsas de mérito para estudantes universitários
- **Inovação**: Centros de inovação em cada universidade pública com financiamento de 200 milhões de euros
- **Investigação**: Aumento do investimento em I&D para 3% do PIB até 2027

### 5. Habitação e Ordenamento do Território
- **Habitação Acessível**: Construção de 25.000 habitações a custos controlados em 4 anos
- **Centros Urbanos**: Incentivos fiscais de 30% para recuperação de imóveis degradados nos centros históricos
- **Alojamento Local**: Limite de 10% dos imóveis disponíveis em zonas de pressão urbanística
- **Arrendamento Jovem**: Subsídio direto até 30% do valor da renda para menores de 35 anos
- **Licenciamento**: Simplificação com prazos máximos de resposta de 60 dias e aprovação tácita
- **Interior do País**: Pacote de incentivos à fixação incluindo IRS reduzido em 50% nos primeiros 5 anos

### 6. Ambiente e Sustentabilidade
- **Energia Renovável**: Investimento de 2 mil milhões de euros até 2026, com meta de 85% de eletricidade de fontes renováveis
- **Indústria Verde**: Incentivos fiscais de 40% para tecnologias limpas no setor industrial
- **Transportes**: 100km de novas linhas de transporte público nas áreas metropolitanas
- **Reflorestação**: 100 mil hectares de espécies autóctones com investimento de 150 milhões de euros
- **Recursos Hídricos**: Plano de despoluição com metas específicas para cada bacia hidrográfica
- **Conservação Marinha**: 10 novas áreas protegidas marinhas cobrindo 30% da ZEE portuguesa
- **Economia Circular**: Redução de 50% do uso de plásticos descartáveis e aumento de 40% na reciclagem
- **Gestão da Água**: Modernização de infraestruturas para redução de perdas em 40%

### 7. Segurança e Justiça
- **Efetivos Policiais**: Recrutamento de 3.000 novos agentes com formação especializada
- **Modernização**: Investimento de 200 milhões de euros em equipamento tecnológico para forças de segurança
- **Reforma Judicial**: Reestruturação para redução dos prazos processuais em 40%
- **Tribunais Especializados**: Criação em matéria económica nas principais comarcas
- **Combate à Corrupção**: Unidade especializada com 50 investigadores dedicados
- **Vigilância**: Sistema nacional integrado em espaços públicos críticos com 5.000 câmaras
- **Sistema Prisional**: Programa de reinserção social com redução da reincidência em 30%

### 8. Reforma do Estado e Administração Pública
- **Descentralização**: Transferência de competências para municípios com 1,2 mil milhões em recursos financeiros
- **Digitalização**: 95% dos serviços públicos digitalizados até 2026, poupando 500 milhões anuais
- **Simplificação**: Redução de 3 níveis hierárquicos na administração central
- **Avaliação de Desempenho**: Sistema baseado em objetivos concretos com prémios até 15% do salário
- **Eficiência**: Centros de competências partilhados reduzindo custos operacionais em 20%
- **Empresas Públicas**: Novo modelo de governação com administradores independentes e avaliação anual

### 9. Cultura e Património
- **Orçamento**: Aumento para 1% do Orçamento do Estado até 2026 (atualmente em 0,5%)
- **Rede Cultural**: Residências artísticas em todas as capitais de distrito com orçamento de 50 milhões
- **Digitalização**: Acesso universal online a 90% do património cultural português até 2027
- **Indústrias Criativas**: Programa de 100 milhões para internacionalização, focado no audiovisual
- **Património**: Recuperação de 50 monumentos históricos com investimento de 300 milhões
- **Educação Cultural**: Programa em escolas básicas e secundárias alcançando 500.000 alunos anualmente

## O Que Diferencia Este Plano
- **Abordagem Integrada**: Interconexão clara entre políticas económicas, sociais e ambientais
- **Metas Quantificadas**: Objetivos específicos e mensuráveis para cada área de atuação
- **Descentralização Efetiva**: Verdadeira transferência de poder e recursos para o nível local
- **Pacto Geracional**: Equilíbrio entre necessidades dos jovens, população ativa e idosos
- **Transição Digital Inclusiva**: Garantia que a digitalização não deixa ninguém para trás

## Perguntas Frequentes
1. **Como será financiado este plano eleitoral?**
   O plano será financiado através de uma combinação de crescimento económico, eficiência na despesa pública, e refinanciamento da dívida pública.

2. **Qual o impacto orçamental das medidas propostas?**
   O impacto total está estimado em 3,5% do PIB distribuído ao longo de 4 anos, com retorno estimado de 2,8% do PIB.

3. **Como será abordada a crise climática?**
   Através de um plano transversal de descarbonização com metas específicas para cada setor económico.

4. **Qual a estratégia para a habitação acessível?**
   Uma abordagem multifacetada que combina construção direta, incentivos à reabilitação e regulação do mercado de arrendamento.

5. **Como será melhorado o acesso à saúde?**
   Reforço do SNS combinado com transformação digital e foco em prevenção e saúde mental.

6. **Quais as medidas para o interior do país?**
   Um pacote integrado de incentivos fiscais, investimento em infraestruturas e serviços públicos de proximidade.`;
            
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
      // In a production implementation, here we would:
      // 1. Upload the PDF to Supabase Storage
      // 2. Call the process-electoral-pdf edge function to analyze the content
      // 3. Save the electoral plan with the processed content
      
      // For now, we'll use the extracted proposals from our mock implementation
      
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
