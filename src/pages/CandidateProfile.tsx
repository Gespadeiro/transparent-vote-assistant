
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  FileText,
  BarChart3, 
  MessageCircle, 
  Building2, 
  Loader2,
  Share 
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface SentimentBarProps {
  value: number;
  color: string;
  label: string;
}

const SentimentBar: React.FC<SentimentBarProps> = ({ value, color, label }) => {
  return (
    <div className="flex items-center">
      <div className="w-20 text-xs text-gray-600">{label}</div>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right text-xs text-gray-600">{value}%</div>
    </div>
  );
};

interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
}

interface Candidate {
  id: string;
  candidate_name: string;
  party: string;
  image_url?: string;
  summary: string | null;
  proposals: string | null;
  sentiment?: Sentiment;
}

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchCandidateDetails() {
      setIsLoading(true);
      try {
        if (!id) {
          toast.error("Candidate ID is required");
          return;
        }

        const { data, error } = await supabase
          .from('electoral_plans')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Transform the data to match our Candidate interface
        const formattedCandidate: Candidate = {
          id: data.id,
          candidate_name: data.candidate_name,
          party: data.party,
          image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80", // Default image
          summary: data.summary,
          proposals: data.proposals,
          sentiment: {
            positive: 65,
            neutral: 25,
            negative: 10
          } // Sample sentiment
        };

        setCandidate(formattedCandidate);
      } catch (error) {
        console.error("Error fetching candidate details:", error);
        toast.error("Failed to load candidate details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCandidateDetails();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${candidate?.candidate_name} - Election Profile`,
        text: `Check out ${candidate?.candidate_name}'s electoral plan`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-election-blue mr-2" />
          <p>Carregando informações do candidato...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 text-center">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium mb-2">Candidato não encontrado</h3>
          <p className="text-gray-500 mb-6">
            O candidato solicitado não existe ou foi removido.
          </p>
          <Link to="/candidates">
            <Button>
              <ArrowLeft size={16} />
              Voltar para lista de candidatos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse proposals if they exist
  let proposalsList: { title: string; description: string }[] = [];
  try {
    if (candidate.proposals) {
      proposalsList = JSON.parse(candidate.proposals);
    }
  } catch (e) {
    console.error("Error parsing proposals:", e);
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <Link to="/candidates" className="inline-flex items-center text-election-blue hover:underline mb-4">
              <ArrowLeft size={16} className="mr-1" />
              Voltar para todos os candidatos
            </Link>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-morphism rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={candidate.image_url} 
                    alt={candidate.candidate_name} 
                    className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover border-2 border-white shadow-md"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">{candidate.candidate_name}</h1>
                      <div className="flex items-center mt-2">
                        <span className="flex items-center text-gray-600 font-medium">
                          <Building2 size={18} className="mr-1.5 text-election-blue" />
                          {candidate.party}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={handleShare} className="ml-2">
                            <Share size={16} className="mr-1.5" />
                            Compartilhar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compartilhar o perfil deste candidato</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">{candidate.summary}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="proposals">Propostas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText size={20} className="mr-2 text-election-blue" />
                    Resumo do Plano Eleitoral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {candidate.summary || "Nenhum resumo disponível para este candidato."}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 size={20} className="mr-2 text-election-blue" />
                    Análise de Sentimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Esta análise representa a percepção pública das propostas do candidato baseada em processamento de linguagem natural.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <SentimentBar value={candidate.sentiment?.positive || 0} color="bg-green-400" label="Positivo" />
                    <SentimentBar value={candidate.sentiment?.neutral || 0} color="bg-gray-400" label="Neutro" />
                    <SentimentBar value={candidate.sentiment?.negative || 0} color="bg-red-400" label="Negativo" />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Interpretação:</h4>
                    <p className="text-sm text-gray-600">
                      As propostas deste candidato são geralmente vistas de forma positiva, com 65% de sentimento positivo.
                      Isso sugere que a maioria do público responde bem às políticas e ideias apresentadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="proposals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText size={20} className="mr-2 text-election-blue" />
                    Propostas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposalsList.length > 0 ? (
                    <div className="space-y-6">
                      {proposalsList.map((proposal, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                          <p className="text-gray-700">{proposal.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhuma proposta detalhada disponível para este candidato.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default CandidateProfile;
