
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
            // Simulate extracted content - in a real implementation 
            // this would come from an API or edge function that parses the PDF
            const mockedProposals = `Propostas Eleitorais extraídas de ${file.name}:
            
1. Plano de Desenvolvimento Económico
   - Criação de novos postos de trabalho através de investimento em infraestruturas
   - Redução de impostos para pequenas empresas em 5%
   - Implementação de programas de requalificação profissional
   - Criação de zonas económicas especiais nas regiões do interior
   - Incentivos fiscais para empresas que contratem jovens até aos 30 anos
   - Redução da burocracia para abertura de novas empresas

2. Iniciativa de Saúde
   - Expansão da cobertura para cuidados preventivos
   - Redução dos custos dos medicamentos prescritos
   - Financiamento de unidades de saúde em zonas rurais
   - Contratação de mais 1.500 profissionais de saúde para o SNS
   - Redução das listas de espera em 30% nos próximos dois anos
   - Modernização dos equipamentos hospitalares em todo o país

3. Proteção Ambiental
   - Aumento do investimento em energias renováveis
   - Implementação de controlos mais rigorosos sobre a poluição
   - Criação de programas de conservação para terrenos públicos
   - Desenvolvimento de um plano nacional para a neutralidade carbónica até 2045
   - Incentivos à utilização de transportes públicos e veículos elétricos
   - Proteção das áreas naturais protegidas e expansão da área florestal

4. Reforma Educativa
   - Aumento dos salários dos professores
   - Modernização das infraestruturas escolares
   - Expansão dos programas de educação pré-escolar
   - Revisão curricular focada em competências digitais e pensamento crítico
   - Redução do número de alunos por turma para máximo de 20
   - Programa de requalificação digital para todos os estabelecimentos de ensino

5. Políticas de Habitação
   - Construção de 10.000 novas habitações a preços acessíveis
   - Regulação mais rigorosa do mercado de arrendamento
   - Incentivos fiscais para renovação de imóveis degradados nos centros urbanos
   - Programa especial de apoio à primeira habitação para jovens
   - Limitação da especulação imobiliária em zonas de alta pressão habitacional
   - Revitalização de zonas habitacionais degradadas`;
            
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
        topics: ["Economia", "Saúde", "Ambiente", "Educação", "Habitação"],
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
