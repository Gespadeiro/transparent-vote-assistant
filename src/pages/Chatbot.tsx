
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Send, Bot, User, Info, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { getChatCompletion } from "@/services/openai";
import { Button } from "@/components/ui/button";

// Message types
interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

// Perguntas sugeridas focadas em planos eleitorais em português
const SUGGESTED_QUESTIONS = [
  "Quais são as principais diferenças políticas entre PSD e PS?", 
  "Quais são as propostas económicas dos candidatos?", 
  "Que reformas na saúde estão a ser propostas?", 
  "Quais são as políticas ambientais nos planos eleitorais?", 
  "Como os candidatos planeiam resolver a crise de habitação?", 
  "Que reformas educacionais estão a ser propostas?"
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message when component mounts
  useEffect(() => {
    setMessages([{
      id: "welcome",
      type: "bot",
      text: "👋 Olá! Sou o assistente de planos eleitorais. Posso fornecer informações detalhadas sobre as propostas e políticas dos candidatos com base nos seus planos eleitorais. Como posso ajudá-lo hoje?",
      timestamp: new Date()
    }]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      // Convert previous messages to format needed for OpenAI
      const previousMessages = messages.filter(msg => msg.id !== "welcome") // Skip welcome message
      .map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text
      }));

      // Get response from OpenAI
      const response = await getChatCompletion(inputValue, previousMessages as any);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Desculpe, não consegui processar o seu pedido. Por favor, tente novamente com uma pergunta sobre os planos eleitorais.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestedQuestion = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      // Convert previous messages to format needed for OpenAI
      const previousMessages = messages.filter(msg => msg.id !== "welcome") // Skip welcome message
      .map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text
      }));

      // Get response from OpenAI
      const response = await getChatCompletion(question, previousMessages as any);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Desculpe, não consegui processar o seu pedido. Por favor, tente novamente mais tarde.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Assistente de Planos Eleitorais
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Faça perguntas sobre planos eleitorais, propostas dos candidatos e posições políticas para obter informações detalhadas baseadas nos planos oficiais na nossa base de dados.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left sidebar - Suggested questions */}
            <div className="lg:col-span-1">
              <div className="glass-morphism p-4 rounded-xl mb-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <MessageSquare size={16} className="mr-2 text-election-blue" />
                  Perguntas Sugeridas
                </h3>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button 
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-sm text-left w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-medium mb-2 text-election-blue flex items-center">
                  <Info size={16} className="mr-2" />
                  Dica
                </h3>
                <p className="text-sm text-gray-600">
                  Pode perguntar sobre candidatos ou partidos específicos, temas como economia, saúde, educação, ou comparar diferentes planos eleitorais.
                </p>
              </div>
            </div>
            
            {/* Right - Chat interface */}
            <div className="lg:col-span-3">
              <div className="neo-card flex flex-col h-[600px]">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 flex items-center">
                  <div className="w-8 h-8 bg-election-blue rounded-full flex items-center justify-center mr-3">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Assistente de Planos Eleitorais</h3>
                    <div className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </div>
                  </div>
                </div>
                
                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map(message => <motion.div key={message.id} initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    y: -10
                  }} transition={{
                    duration: 0.3
                  }} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] flex items-start gap-2 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-election-blue" : "bg-gray-200"}`}>
                            {message.type === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-700" />}
                          </div>
                          
                          <div className={`p-3 rounded-lg ${message.type === "user" ? "bg-election-blue text-white rounded-tr-none" : "glass-morphism rounded-tl-none"}`}>
                            <p className="text-sm whitespace-pre-line">{message.text}</p>
                            <div className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-400"}`}>
                              {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                            </div>
                            
                            {message.type === "bot" && message.id !== "welcome" && <div className="flex items-center space-x-2 mt-2">
                                <button className="text-xs text-gray-400 hover:text-election-blue transition-colors duration-200 flex items-center">
                                  <ThumbsUp size={12} className="mr-1" />
                                  Útil
                                </button>
                                <button className="text-xs text-gray-400 hover:text-election-blue transition-colors duration-200 flex items-center">
                                  <ThumbsDown size={12} className="mr-1" />
                                  Não útil
                                </button>
                              </div>}
                          </div>
                        </div>
                      </motion.div>)}
                    
                    {isLoading && <motion.div initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    y: -10
                  }} className="flex justify-start">
                        <div className="max-w-[80%] flex items-start gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-gray-700" />
                          </div>
                          <div className="glass-morphism p-3 rounded-lg rounded-tl-none">
                            <div className="flex items-center space-x-2">
                              <Loader2 size={16} className="animate-spin text-election-blue" />
                              <p className="text-sm text-gray-500">A analisar planos eleitorais...</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>}
                    
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </div>
                
                {/* Input container */}
                <div className="p-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Pergunte sobre planos eleitorais e propostas políticas..." className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-election-blue/20 focus:border-election-blue transition-all duration-300" disabled={isLoading} />
                    <button type="submit" disabled={!inputValue.trim() || isLoading} className={`p-3 rounded-lg ${!inputValue.trim() || isLoading ? "bg-gray-100 text-gray-400" : "bg-election-blue text-white hover:bg-blue-600"} transition-all duration-300`}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Chatbot;
