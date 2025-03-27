
import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  BarChart3, 
  User, 
  FileText, 
  TrendingUp, 
  MessageCircle, 
  Search
} from "lucide-react";

const MOCK_CANDIDATES = [
  {
    id: 1,
    name: "António Costa",
    party: "Partido Socialista",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    sentiment: { positive: 65, neutral: 25, negative: 10 },
    topics: ["Saúde", "Educação", "Ambiente", "Economia"],
    summary: "Defende um sistema de saúde universal, aumento do financiamento à educação e ações mais agressivas contra as alterações climáticas. Propõe impostos mais altos para empresas e indivíduos ricos."
  },
  {
    id: 2,
    name: "Luís Montenegro",
    party: "Partido Social Democrata",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    sentiment: { positive: 55, neutral: 30, negative: 15 },
    topics: ["Economia", "Segurança", "Imigração", "Reforma Fiscal"],
    summary: "Foca no crescimento económico através de desregulamentação e cortes de impostos. Defende maior segurança nas fronteiras e um sistema de imigração baseado em mérito."
  },
  {
    id: 3,
    name: "Mariana Mortágua",
    party: "Bloco de Esquerda",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    sentiment: { positive: 70, neutral: 20, negative: 10 },
    topics: ["Unidade", "Saúde", "Infraestrutura", "Educação"],
    summary: "Promove soluções para reforma do sistema de saúde e investimento em infraestrutura. Busca políticas moderadas que apelem a eleitores de todo o espectro político."
  }
];

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
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-10 text-right text-xs text-gray-600">{value}%</div>
    </div>
  );
};

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  
  const topics = ["Todos", "Economia", "Saúde", "Educação", "Ambiente", "Segurança", "Imigração"];
  
  const filteredCandidates = MOCK_CANDIDATES.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          candidate.party.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTopic = selectedTopic === "Todos" || candidate.topics.includes(selectedTopic);
    
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Compare Candidatos
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore perfis detalhados, analise sentimentos e entenda onde cada candidato
              se posiciona em questões importantes usando insights alimentados por IA.
            </p>
          </motion.div>
          
          {/* Search and Filter */}
          <div className="glass-morphism rounded-xl p-4 mb-10 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar candidatos ou partidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-election-blue/20 focus:border-election-blue transition-all duration-300"
                />
              </div>
              
              <div className="flex overflow-x-auto py-1 gap-2 no-scrollbar">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      selectedTopic === topic 
                        ? "bg-election-blue text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Candidates Grid */}
      <section className="px-6">
        <div className="container mx-auto">
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="neo-card h-full"
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <img 
                      src={candidate.image} 
                      alt={candidate.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.topics.slice(0, 2).map(topic => (
                          <span 
                            key={topic} 
                            className="text-xs bg-blue-50 text-election-blue px-2 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        {candidate.topics.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{candidate.topics.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium flex items-center mb-3">
                      <FileText size={16} className="mr-2 text-election-blue" />
                      Resumo
                    </h4>
                    <p className="text-sm text-gray-600">{candidate.summary}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium flex items-center mb-3">
                      <BarChart3 size={16} className="mr-2 text-election-blue" />
                      Análise de Sentimento
                    </h4>
                    <div className="space-y-2">
                      <SentimentBar 
                        value={candidate.sentiment.positive} 
                        color="bg-green-400" 
                        label="Positivo" 
                      />
                      <SentimentBar 
                        value={candidate.sentiment.neutral} 
                        color="bg-gray-400" 
                        label="Neutro" 
                      />
                      <SentimentBar 
                        value={candidate.sentiment.negative} 
                        color="bg-red-400" 
                        label="Negativo" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button className="text-sm text-election-blue hover:underline flex items-center">
                      Ver perfil detalhado
                      <TrendingUp size={14} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Nenhum candidato encontrado</h3>
              <p className="text-gray-500">
                Tente ajustar sua pesquisa ou filtros para encontrar candidatos.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Candidates;
