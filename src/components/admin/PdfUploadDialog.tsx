
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileUp, Upload, X, FileText, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is a PDF
      if (file.type !== "application/pdf") {
        toast.error("Por favor, carregue um ficheiro PDF");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const extractContentFromPdf = async () => {
    if (!selectedFile) {
      setError("Nenhum ficheiro selecionado");
      return false;
    }

    if (!candidateName || !party) {
      setError("Nome do candidato e partido são obrigatórios");
      return false;
    }
    
    setExtractingContent(true);
    setError(null);
    
    try {
      // Read the PDF file as an ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64String = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      console.log("PDF loaded and converted to base64, length:", base64String.length);
      
      // Process the PDF with OpenAI
      const { data, error: functionError } = await supabase.functions.invoke("process-electoral-pdf", {
        body: { 
          pdfBase64: base64String,
          candidateName,
          party
        }
      });
      
      console.log("Response from process-electoral-pdf:", { data, error: functionError });
      
      if (functionError) {
        console.error("Erro ao processar PDF:", functionError);
        setError(`Erro ao processar PDF: ${functionError.message}`);
        return false;
      }
      
      if (data && data.proposals) {
        setExtractedProposals(data.proposals);
        toast.success("Conteúdo extraído com sucesso do PDF");
        return true;
      } else if (data && data.error) {
        setError(`Erro do servidor: ${data.error}`);
        console.error("Erro do servidor:", data.error);
        return false;
      } else {
        console.error("Resposta inválida do processamento do PDF:", data);
        setError("Resposta inválida do processamento do PDF");
        return false;
      }
    } catch (error) {
      console.error("Erro ao extrair conteúdo do PDF:", error);
      setError(`Falha ao extrair conteúdo do PDF: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return false;
    } finally {
      setExtractingContent(false);
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
    setError(null);
    
    try {
      // If proposals haven't been extracted yet, do it now
      if (!extractedProposals) {
        const extracted = await extractContentFromPdf();
        if (!extracted) {
          setUploading(false);
          return;
        }
      }
      
      // Note: Using snake_case property names to match Supabase column names
      const planData = {
        candidate_name: candidateName,
        party: party,
        summary: `Plano eleitoral para ${candidateName} (${party})`,
        proposals: extractedProposals,
        original_pdf: selectedFile.name
      };
      
      console.log("Saving electoral plan to database:", planData);
      
      // Insert the electoral plan into the database
      const { data, error } = await supabase
        .from('electoral_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao inserir plano eleitoral:", error);
        setError(`Erro ao inserir plano eleitoral: ${error.message}`);
        throw error;
      }
      
      console.log("Electoral plan saved successfully:", data);
      
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
    setError(null);
  };

  const handleProcessPdf = async () => {
    if (!selectedFile || !candidateName || !party) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    await extractContentFromPdf();
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
          
          {/* Add a button to process PDF without saving */}
          {selectedFile && !extractedProposals && !extractingContent && (
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleProcessPdf}
                disabled={!selectedFile || !candidateName || !party}
              >
                Processar PDF
              </Button>
            </div>
          )}
          
          {extractingContent && (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
              <span className="text-sm">A extrair propostas do PDF...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
            <Button 
              type="submit" 
              disabled={!selectedFile || uploading || extractingContent || !extractedProposals}
            >
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
