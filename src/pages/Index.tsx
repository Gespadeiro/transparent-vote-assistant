
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
      title: "Candidate Comparison",
      description: "Easily compare candidates side by side based on their proposals and political positions.",
      icon: <HeartHandshake size={24} />,
      path: "/candidates"
    },
    {
      title: "Proposal Summarization",
      description: "AI-powered summaries of candidates' electoral programs for quick understanding.",
      icon: <FileText size={24} />,
      path: "/candidates"
    },
    {
      title: "Sentiment Analysis",
      description: "Track communication patterns and message tone from speeches and social media.",
      icon: <BarChart3 size={24} />,
      path: "/candidates"
    },
    {
      title: "Q&A Chatbot",
      description: "Ask questions about candidates, elections, and proposals for immediate answers.",
      icon: <Bot size={24} />,
      path: "/chatbot"
    },
    {
      title: "Personalized Quiz",
      description: "Discover which candidates align with your values through an interactive quiz.",
      icon: <CheckSquare size={24} />,
      path: "/quiz"
    },
    {
      title: "Data Visualization",
      description: "Clear and intuitive visualizations of electoral data and candidate positions.",
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Tools designed to help you navigate the complexities of elections 
              and make decisions aligned with your values.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Our platform uses artificial intelligence to provide objective, data-driven insights.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Explore candidates",
                description: "Browse candidate profiles, their proposals, and political history."
              },
              {
                step: "02",
                title: "Analyze data",
                description: "Review sentiment analysis, voting records, and proposal summaries."
              },
              {
                step: "03",
                title: "Find your match",
                description: "Take our quiz to discover which candidates align with your values."
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
                  Ready to make an informed decision?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start exploring candidates and discover who best represents your values and interests.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => navigate('/candidates')}
                    className="glass-morphism hover:bg-election-blue/10 px-6 py-3 rounded-full font-medium text-election-blue border border-election-blue/30 flex items-center justify-center group transition-all duration-300"
                  >
                    Explore Candidates
                    <ExternalLink size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button 
                    onClick={() => navigate('/quiz')}
                    className="bg-election-blue hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center transition-all duration-300"
                  >
                    Take the Quiz
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
                      of voters found their ideal candidate using our platform
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
                <span className="text-election-blue font-bold">Transparent</span>
                <span>Election</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Making elections more transparent, one vote at a time.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 text-center md:text-right">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Transparent Election. All rights reserved.
              </div>
              <div className="text-xs text-gray-400">
                A platform for informed electoral decisions
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
