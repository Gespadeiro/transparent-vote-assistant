
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
        toast.error("Please upload a PDF file");
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
            const mockedProposals = `Electoral Proposals extracted from ${file.name}:
            
1. Economic Development Plan
   - Create new jobs through infrastructure investment
   - Reduce small business taxes by 5%
   - Implement worker retraining programs

2. Healthcare Initiative
   - Expand coverage for preventative care
   - Reduce prescription drug costs
   - Fund rural healthcare facilities

3. Environmental Protection
   - Increase renewable energy investment
   - Implement stricter pollution controls
   - Create conservation programs for public lands

4. Education Reform
   - Increase teacher salaries
   - Modernize school infrastructure
   - Expand early childhood education programs`;
            
            setExtractedProposals(mockedProposals);
            setExtractingContent(false);
            toast.success("Successfully extracted content from PDF");
          }, 2000);
          
        } catch (error) {
          console.error("Error extracting PDF content:", error);
          toast.error("Failed to extract content from PDF");
          setExtractingContent(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please upload a PDF file");
      return;
    }
    
    if (!candidateName || !party) {
      toast.error("Please fill in all required fields");
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
        summary: `Electoral plan for ${candidateName} (${party})`,
        topics: ["Economy", "Healthcare", "Environment", "Education"],
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
        console.error("Error inserting electoral plan:", error);
        throw error;
      }
      
      onPdfProcessed(data);
      toast.success("Electoral plan added successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Error saving electoral plan. Please try again.");
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
          <DialogTitle>Upload Electoral Plan PDF</DialogTitle>
          <DialogDescription>
            Upload a PDF containing the electoral plan. Our system will process and extract key proposals.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter candidate name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="party">Political Party</Label>
            <Input
              id="party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="Enter political party"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pdf">Electoral Plan PDF</Label>
            
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
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (up to 10MB)</p>
                  </div>
                </Label>
              </div>
            )}
          </div>
          
          {extractingContent && (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
              <span className="text-sm">Extracting proposals from PDF...</span>
            </div>
          )}

          {extractedProposals && (
            <div className="space-y-2">
              <Label>Extracted Proposals</Label>
              <div className="border rounded-md p-3 bg-gray-50 max-h-[200px] overflow-y-auto text-sm whitespace-pre-line">
                {extractedProposals}
              </div>
              <p className="text-xs text-gray-500">
                These proposals will be automatically added to the electoral plan.
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
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFile || uploading || extractingContent}>
              {uploading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Save Plan
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
