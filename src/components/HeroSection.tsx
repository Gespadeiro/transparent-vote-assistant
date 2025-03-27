
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative py-20 md:py-32 lg:py-40 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight gradient-text">
              Decisões de voto informadas através da transparência
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Analise facilmente programas eleitorais, compare candidatos e descubra quem melhor se alinha com os seus valores usando a nossa plataforma alimentada por IA.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => navigate("/candidates")}
              className="bg-election-blue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center transition-all duration-300"
            >
              Explorar Candidatos
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/quiz")}
              className="bg-white hover:bg-gray-100 text-election-blue border border-election-blue px-6 py-3 rounded-full font-medium transition-all duration-300"
            >
              Fazer Questionário
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
