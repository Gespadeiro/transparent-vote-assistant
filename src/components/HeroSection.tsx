
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col space-y-6"
          >
            <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-election-blue rounded-full inline-block w-fit">
              Make informed decisions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your guide to <span className="text-gradient">transparent</span> elections
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 md:pr-10">
              Understand candidate positions, analyze their proposals, and discover who truly 
              represents your values.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button 
                onClick={() => navigate('/candidates')}
                className="glass-morphism hover:bg-election-blue/10 px-8 py-3 rounded-full font-medium text-election-blue border border-election-blue/30 flex items-center justify-center group transition-all duration-300"
              >
                Explore Candidates
                <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => navigate('/quiz')}
                className="bg-election-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium flex items-center justify-center transition-all duration-300"
              >
                Take the Quiz
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden glass-morphism p-6 relative mx-auto max-w-md">
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-full z-0"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-full z-0"></div>
              
              <div className="relative z-10 h-full flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs bg-white/50 px-3 py-1 rounded-full">
                    Transparent Election
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="mt-2 h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="mt-1 h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-election-blue/20"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="mt-2 h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="mt-1 h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="bg-election-blue/10 p-3 rounded-lg mt-4">
                    <div className="text-xs text-election-blue font-medium">Analyze candidate data</div>
                    <div className="flex justify-between mt-2">
                      <div className="h-2 w-1/3 bg-election-blue rounded-full"></div>
                      <div className="text-xs">76%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-50 rounded-full filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default HeroSection;
