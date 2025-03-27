import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  Send, 
  Bot, 
  User, 
  Info, 
  Loader2, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { getChatCompletion } from "@/services/openai";
import { Button } from "@/components/ui/button";

// Message types
interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

// Better suggested questions focused on electoral plans
const SUGGESTED_QUESTIONS = [
  "What are the main policy differences between PSD and PS?",
  "What are the economic proposals in the electoral plans?",
  "What healthcare reforms are candidates proposing?",
  "What environmental policies are in the electoral plans?",
  "How do the candidates plan to address housing issues?",
  "What educational reforms are being proposed?"
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Add initial welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        text: "👋 Hello! I'm your electoral plans assistant. I can provide information about candidate proposals and policies based on their electoral plans. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const previousMessages = messages
        .filter(msg => msg.id !== "welcome") // Skip welcome message
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
        text: "Sorry, I couldn't process your request. Please try again with a question about the electoral plans.",
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
      const previousMessages = messages
        .filter(msg => msg.id !== "welcome") // Skip welcome message
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
        text: "Sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Electoral Plans Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ask questions about electoral plans, candidate proposals, and policy positions to get information based on the official plans in our database.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left sidebar - Suggested questions */}
            <div className="lg:col-span-1">
              <div className="neo-card h-full">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-election-blue" />
                  Suggested Questions
                </h3>
                <div className="space-y-3">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left p-3 text-sm rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-election-blue transition-all duration-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info size={16} className="mr-2 text-election-blue mt-1 shrink-0" />
                    <p className="text-xs text-gray-600">
                      This chatbot provides information based on the electoral plans stored in our database. 
                      All responses are generated using the actual content of candidate proposals and policy positions.
                    </p>
                  </div>
                </div>
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
                    <h3 className="font-medium">Electoral Plans Assistant</h3>
                    <div className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </div>
                  </div>
                </div>
                
                {/* Messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] flex items-start gap-2 ${
                            message.type === "user" 
                              ? "flex-row-reverse" 
                              : "flex-row"
                          }`}
                        >
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === "user" 
                                ? "bg-election-blue" 
                                : "bg-gray-200"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User size={16} className="text-white" />
                            ) : (
                              <Bot size={16} className="text-gray-700" />
                            )}
                          </div>
                          
                          <div 
                            className={`p-3 rounded-lg ${
                              message.type === "user" 
                                ? "bg-election-blue text-white rounded-tr-none" 
                                : "glass-morphism rounded-tl-none"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <div 
                              className={`text-xs mt-1 ${
                                message.type === "user" 
                                  ? "text-blue-100" 
                                  : "text-gray-400"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            
                            {message.type === "bot" && message.id !== "welcome" && (
                              <div className="flex items-center space-x-2 mt-2">
                                <button className="text-xs text-gray-400 hover:text-election-blue transition-colors duration-200 flex items-center">
                                  <ThumbsUp size={12} className="mr-1" />
                                  Helpful
                                </button>
                                <button className="text-xs text-gray-400 hover:text-election-blue transition-colors duration-200 flex items-center">
                                  <ThumbsDown size={12} className="mr-1" />
                                  Not helpful
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[80%] flex items-start gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-gray-700" />
                          </div>
                          <div className="glass-morphism p-3 rounded-lg rounded-tl-none">
                            <div className="flex items-center space-x-2">
                              <Loader2 size={16} className="animate-spin text-election-blue" />
                              <p className="text-sm text-gray-500">Thinking...</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </div>
                
                {/* Input container */}
                <div className="p-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about electoral plans and policy proposals..."
                      className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-election-blue/20 focus:border-election-blue transition-all duration-300"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className={`p-3 rounded-lg ${
                        !inputValue.trim() || isLoading
                          ? "bg-gray-100 text-gray-400"
                          : "bg-election-blue text-white hover:bg-blue-600"
                      } transition-all duration-300`}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chatbot;
