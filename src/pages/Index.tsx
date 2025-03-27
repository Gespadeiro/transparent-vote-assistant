
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { 
  BarChart3, 
  Bot, 
  FileText, 
  HeartHandshake, 
  CheckSquare, 
  TrendingUp,
  ExternalLink
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Comparação de Candidatos",
      description: "Compare facilmente candidatos lado a lado com base nas suas propostas e posições políticas.",
      icon: <HeartHandshake size={24} />,
      path: "/candidates"
    },
    {
      title: "Resumo de Propostas",
      description: "Resumos alimentados por IA dos programas eleitorais dos candidatos para uma compreensão rápida.",
      icon: <FileText size={24} />,
      path: "/candidates"
    },
    {
      title: "Análise de Sentimento",
      description: "Acompanhe padrões de comunicação e tom de mensagem de discursos e redes sociais.",
      icon: <BarChart3 size={24} />,
      path: "/candidates"
    },
    {
      title: "Assistente Virtual",
      description: "Faça perguntas sobre candidatos, eleições e propostas para respostas imediatas.",
      icon: <Bot size={24} />,
      path: "/chatbot"
    },
    {
      title: "Questionário Personalizado",
      description: "Descubra quais candidatos se alinham com os seus valores através de um questionário interativo.",
      icon: <CheckSquare size={24} />,
      path: "/quiz"
    },
    {
      title: "Visualização de Dados",
      description: "Visualizações claras e intuitivas de dados eleitorais e posições dos candidatos.",
      icon: <TrendingUp size={24} />,
      path: "/candidates"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Ferramentas projetadas para ajudar a navegar pelas complexidades das eleições 
              e tomar decisões alinhadas com os seus valores.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                onClick={() => navigate(feature.path)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Nossa plataforma utiliza inteligência artificial para fornecer insights objetivos baseados em dados.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Explore candidatos",
                description: "Navegue pelos perfis dos candidatos, suas propostas e histórico político."
              },
              {
                step: "02",
                title: "Analise dados",
                description: "Reveja análise de sentimento, histórico de votação e resumos de propostas."
              },
              {
                step: "03",
                title: "Encontre seu candidato ideal",
                description: "Faça nosso questionário para descobrir quais candidatos se alinham com seus valores."
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="neo-card group text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-election-blue font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-morphism rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full filter blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Pronto para tomar uma decisão informada?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Comece a explorar candidatos e descubra quem melhor representa seus valores e interesses.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => navigate('/candidates')}
                    className="glass-morphism hover:bg-election-blue/10 px-6 py-3 rounded-full font-medium text-election-blue border border-election-blue/30 flex items-center justify-center group transition-all duration-300"
                  >
                    Explorar Candidatos
                    <ExternalLink size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button 
                    onClick={() => navigate('/quiz')}
                    className="bg-election-blue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center transition-all duration-300"
                  >
                    Fazer Questionário
                  </button>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="w-full md:w-1/3 aspect-square rounded-2xl glass-morphism p-6 flex items-center justify-center"
              >
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full bg-blue-50 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl font-bold text-election-blue mb-2">76%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      dos eleitores encontraram seu candidato ideal usando nossa plataforma
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-lg font-semibold flex items-center space-x-2">
                <span className="text-election-blue font-bold">Eleições</span>
                <span>Transparentes</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Tornando as eleições mais transparentes, um voto de cada vez.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 text-center md:text-right">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Eleições Transparentes. Todos os direitos reservados.
              </div>
              <div className="text-xs text-gray-400">
                Uma plataforma para decisões eleitorais informadas
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
