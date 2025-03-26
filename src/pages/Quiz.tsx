
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BarChart3,
  Award,
  User,
  RefreshCw
} from "lucide-react";

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "How should healthcare be managed?",
    options: [
      { id: "a", text: "Universal public healthcare system for all citizens", alignment: "progressive" },
      { id: "b", text: "Mix of public and private healthcare options", alignment: "moderate" },
      { id: "c", text: "Primarily market-based healthcare with minimal government involvement", alignment: "conservative" }
    ]
  },
  {
    id: 2,
    question: "What approach to taxation do you prefer?",
    options: [
      { id: "a", text: "Progressive taxation with higher rates for wealthy individuals", alignment: "progressive" },
      { id: "b", text: "Moderate tax rates with targeted incentives", alignment: "moderate" },
      { id: "c", text: "Lower tax rates across the board to stimulate economic growth", alignment: "conservative" }
    ]
  },
  {
    id: 3,
    question: "How should environmental issues be addressed?",
    options: [
      { id: "a", text: "Aggressive regulations and investment in renewable energy", alignment: "progressive" },
      { id: "b", text: "Balanced approach with moderate regulations and market incentives", alignment: "moderate" },
      { id: "c", text: "Market-driven solutions with minimal government intervention", alignment: "conservative" }
    ]
  },
  {
    id: 4,
    question: "What is your position on education funding?",
    options: [
      { id: "a", text: "Significantly increase public education funding and make college free", alignment: "progressive" },
      { id: "b", text: "Moderate increases in education funding with some subsidies for higher education", alignment: "moderate" },
      { id: "c", text: "Focus on private education options and school choice", alignment: "conservative" }
    ]
  },
  {
    id: 5,
    question: "What immigration policies do you support?",
    options: [
      { id: "a", text: "Welcoming immigration policies with paths to citizenship", alignment: "progressive" },
      { id: "b", text: "Balanced approach to legal immigration with moderate enforcement", alignment: "moderate" },
      { id: "c", text: "Strict immigration enforcement and border security", alignment: "conservative" }
    ]
  }
];

// Mock candidates
const CANDIDATES = [
  {
    id: 1,
    name: "Alexandra Johnson",
    party: "Progressive Party",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    alignment: "progressive"
  },
  {
    id: 2,
    name: "Michael Reynolds",
    party: "Conservative Alliance",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    alignment: "conservative"
  },
  {
    id: 3,
    name: "Sophia Rodriguez",
    party: "Centrist Coalition",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
    alignment: "moderate"
  }
];

interface UserAnswer {
  questionId: number;
  selectedOption: string;
  alignment: string;
}

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState<any[]>([]);
  
  const handleOptionSelect = (questionId: number, optionId: string, alignment: string) => {
    const existingAnswerIndex = userAnswers.findIndex(
      answer => answer.questionId === questionId
    );
    
    const newAnswer: UserAnswer = {
      questionId,
      selectedOption: optionId,
      alignment
    };
    
    let updatedAnswers;
    
    if (existingAnswerIndex !== -1) {
      updatedAnswers = [...userAnswers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
      updatedAnswers = [...userAnswers, newAnswer];
    }
    
    setUserAnswers(updatedAnswers);
    
    // Auto advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 500);
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    // Calculate alignment scores
    const alignmentScores = userAnswers.reduce((acc, answer) => {
      acc[answer.alignment] = (acc[answer.alignment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get total score
    const totalQuestions = QUIZ_QUESTIONS.length;
    
    // Calculate candidate matches based on alignment scores
    const candidateMatches = CANDIDATES.map(candidate => {
      const candidateAlignmentScore = alignmentScores[candidate.alignment] || 0;
      const matchPercentage = Math.round((candidateAlignmentScore / totalQuestions) * 100);
      
      return {
        ...candidate,
        matchPercentage
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    setMatchedCandidates(candidateMatches);
    setShowResults(true);
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setMatchedCandidates([]);
  };
  
  const isQuestionAnswered = (questionId: number) => {
    return userAnswers.some(answer => answer.questionId === questionId);
  };
  
  const getSelectedOption = (questionId: number) => {
    const answer = userAnswers.find(answer => answer.questionId === questionId);
    return answer ? answer.selectedOption : null;
  };
  
  const progress = (currentQuestion + 1) / QUIZ_QUESTIONS.length * 100;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Political Match
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Answer a few questions about your political preferences to discover 
              which candidates align most closely with your values.
            </p>
          </motion.div>
          
          {/* Quiz container */}
          <div className="neo-card overflow-hidden">
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-election-blue"
              />
            </div>
            
            <AnimatePresence mode="wait">
              {!showResults ? (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="p-8"
                >
                  <div className="text-sm text-gray-500 mb-6">
                    Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-8">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h2>
                  
                  <div className="space-y-4 mb-10">
                    {QUIZ_QUESTIONS[currentQuestion].options.map((option) => {
                      const isSelected = getSelectedOption(QUIZ_QUESTIONS[currentQuestion].id) === option.id;
                      
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionSelect(
                            QUIZ_QUESTIONS[currentQuestion].id, 
                            option.id, 
                            option.alignment
                          )}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left p-4 rounded-xl border flex items-center transition-all duration-300 ${
                            isSelected 
                              ? "border-election-blue bg-blue-50" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                            isSelected 
                              ? "border-election-blue bg-election-blue text-white" 
                              : "border-gray-300"
                          }`}>
                            {isSelected && <CheckCircle2 size={16} />}
                          </div>
                          <span>{option.text}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className={`flex items-center ${
                        currentQuestion === 0 
                          ? "text-gray-300 cursor-not-allowed" 
                          : "text-gray-600 hover:text-election-blue"
                      } transition-colors duration-300`}
                    >
                      <ChevronLeft size={20} className="mr-1" />
                      Previous
                    </button>
                    
                    {currentQuestion < QUIZ_QUESTIONS.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={!isQuestionAnswered(QUIZ_QUESTIONS[currentQuestion].id)}
                        className={`flex items-center ${
                          !isQuestionAnswered(QUIZ_QUESTIONS[currentQuestion].id) 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-600 hover:text-election-blue"
                        } transition-colors duration-300`}
                      >
                        Next
                        <ChevronRight size={20} className="ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={userAnswers.length !== QUIZ_QUESTIONS.length}
                        className={`px-6 py-2 rounded-lg ${
                          userAnswers.length !== QUIZ_QUESTIONS.length 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-election-blue text-white hover:bg-blue-600"
                        } transition-all duration-300`}
                      >
                        See Results
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="p-8"
                >
                  <div className="text-center mb-10">
                    <Award size={40} className="text-election-blue mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Your Political Matches</h2>
                    <p className="text-gray-600 max-w-lg mx-auto">
                      Based on your answers, here are the candidates who most closely align with your political views.
                    </p>
                  </div>
                  
                  <div className="space-y-6 mb-10">
                    {matchedCandidates.map((candidate, index) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center p-5 rounded-xl border border-gray-200 bg-white"
                      >
                        {index === 0 && (
                          <div className="absolute -top-3 -right-3 bg-election-blue text-white text-xs font-medium px-3 py-1 rounded-full">
                            Best Match
                          </div>
                        )}
                        
                        <div className="relative mr-4">
                          <img 
                            src={candidate.image} 
                            alt={candidate.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-white"
                          />
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-election-blue rounded-full flex items-center justify-center">
                              <Award size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.party}</p>
                          
                          <div className="mt-2 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.matchPercentage}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full ${
                                index === 0 
                                  ? "bg-election-blue" 
                                  : index === 1 
                                    ? "bg-blue-400" 
                                    : "bg-blue-300"
                              }`}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Match</span>
                            <span className="text-xs font-medium text-election-blue">
                              {candidate.matchPercentage}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleRetakeQuiz}
                      className="flex items-center px-6 py-3 rounded-lg border border-election-blue text-election-blue hover:bg-blue-50 transition-all duration-300"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Retake Quiz
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quiz;
