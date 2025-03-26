
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

// Message types
interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

// Mock suggested questions
const SUGGESTED_QUESTIONS = [
  "How does the electoral process work?",
  "What are the main policy differences between candidates?",
  "When is the next election day?",
  "What documents do I need to vote?",
  "How can I check my voter registration status?",
  "What are the main environmental proposals?"
];

// Mock responses
const BOT_RESPONSES: Record<string, string> = {
  "How does the electoral process work?": 
    "The electoral process involves several stages: voter registration, candidate nomination, campaigning, voting, and result declaration. Each citizen aged 18 and above can register to vote. Elections are held on scheduled dates where voters cast ballots for their preferred candidates. The votes are then counted, and winners are declared according to the electoral system in place.",
  
  "What are the main policy differences between candidates?": 
    "The main policy differences between candidates typically revolve around approaches to economy, healthcare, education, and environment. Progressive candidates generally advocate for expanded public services and stronger regulations, while conservative candidates often support smaller government and free-market solutions. Centrist candidates typically seek balanced approaches that incorporate elements from both perspectives.",
  
  "When is the next election day?": 
    "The next election is scheduled for November 5, 2024. This will be a general election for national and state offices. Polls will be open from 7:00 AM to 8:00 PM in most locations. Early voting options may be available in your area starting two weeks before election day.",
  
  "What documents do I need to vote?": 
    "To vote, you typically need a government-issued photo ID such as a driver's license, passport, or voter identification card. Requirements vary by jurisdiction, so it's best to check with your local election office. Some locations also accept utility bills, bank statements, or government checks as proof of identity and residence.",
  
  "How can I check my voter registration status?": 
    "You can check your voter registration status through your state's election website, or through national resources like vote.org. You'll need to provide basic information such as your name, date of birth, and address. If you find you're not registered, many states offer online registration options.",
  
  "What are the main environmental proposals?": 
    "The main environmental proposals from candidates include approaches to climate change, conservation, and sustainable development. Progressive candidates typically support aggressive carbon reduction targets, renewable energy investments, and stronger environmental regulations. Conservative candidates often favor market-based solutions and balancing environmental protection with economic growth. All major candidates acknowledge the importance of clean air and water protections."
};

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
        text: "👋 Hello! I'm your election assistant. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
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
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: getBotResponse(userMessage.text),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSuggestedQuestion = (question: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: getBotResponse(question),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };
  
  // Get bot response based on user input
  const getBotResponse = (userInput: string): string => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Check for exact matches in our mock responses
    for (const question in BOT_RESPONSES) {
      if (normalizedInput === question.toLowerCase()) {
        return BOT_RESPONSES[question];
      }
    }
    
    // Check for partial matches
    for (const question in BOT_RESPONSES) {
      if (normalizedInput.includes(question.toLowerCase().split(" ")[0])) {
        return BOT_RESPONSES[question];
      }
    }
    
    // Default response if no match is found
    return "I don't have specific information on that topic yet. I'm continuously learning to provide better answers about the election process and candidates. Feel free to try another question or check back later.";
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
              Election Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ask questions about candidates, electoral processes, and proposals to get instant, 
              AI-powered responses based on verified information.
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
                      This chatbot provides information based on verified data about the election process 
                      and candidates. Responses are generated using AI and may be refined over time.
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
                    <h3 className="font-medium">Election Assistant</h3>
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
                      placeholder="Type your question..."
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
