
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BarChart3,
  Award,
  User,
  RefreshCw,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizOption {
  id: string;
  option_id: string;
  text: string;
  alignment: string;
  question_id: string;
}

interface QuizQuestion {
  id: number | string;
  question: string;
  options: QuizOption[];
}

interface UserAnswer {
  questionId: number | string;
  selectedOption: string;
  alignment: string;
}

interface Candidate {
  id: number;
  name: string;
  party: string;
  image: string;
  alignment: string;
  matchPercentage?: number;
}

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

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuizQuestions = async () => {
      setIsLoading(true);
      try {
        // First, get all quiz questions
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (questionsError) throw questionsError;
        
        if (!questions || questions.length === 0) {
          setQuizQuestions([]);
          setIsLoading(false);
          return;
        }
        
        // Then, for each question, get its options
        const questionsWithOptions = await Promise.all(
          questions.map(async (question) => {
            const { data: options, error: optionsError } = await supabase
              .from('quiz_options')
              .select('*')
              .eq('question_id', question.id);
              
            if (optionsError) throw optionsError;
            
            return {
              ...question,
              options: options || []
            };
          })
        );
        
        setQuizQuestions(questionsWithOptions);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        toast.error("Failed to load quiz questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizQuestions();
  }, []);
  
  const handleOptionSelect = (questionId: number | string, optionId: string, alignment: string) => {
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
      if (currentQuestion < quizQuestions.length - 1) {
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
    if (currentQuestion < quizQuestions.length - 1) {
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
    const totalQuestions = quizQuestions.length;
    
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
  
  const isQuestionAnswered = (questionId: number | string) => {
    return userAnswers.some(answer => answer.questionId === questionId);
  };
  
  const getSelectedOption = (questionId: number | string) => {
    const answer = userAnswers.find(answer => answer.questionId === questionId);
    return answer ? answer.selectedOption : null;
  };
  
  const progress = quizQuestions.length ? (currentQuestion + 1) / quizQuestions.length * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Navbar />
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-election-blue" />
                <p className="text-lg text-gray-600">Loading quiz questions...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen pb-20">
        <Navbar />
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Find Your Political Match
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                Answer a few questions about your political preferences to discover 
                which candidates align most closely with your values.
              </p>
              <div className="neo-card p-8">
                <p className="text-xl mb-4">No quiz questions are available at the moment.</p>
                <p className="text-gray-600">Please check back later or contact the administrator.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-8">
                    {quizQuestions[currentQuestion]?.question}
                  </h2>
                  
                  <div className="space-y-4 mb-10">
                    {quizQuestions[currentQuestion]?.options.map((option) => {
                      const isSelected = getSelectedOption(quizQuestions[currentQuestion].id) === option.option_id;
                      
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionSelect(
                            quizQuestions[currentQuestion].id, 
                            option.option_id, 
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
                    
                    {currentQuestion < quizQuestions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={!isQuestionAnswered(quizQuestions[currentQuestion].id)}
                        className={`flex items-center ${
                          !isQuestionAnswered(quizQuestions[currentQuestion].id) 
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
                        disabled={userAnswers.length !== quizQuestions.length}
                        className={`px-6 py-2 rounded-lg ${
                          userAnswers.length !== quizQuestions.length 
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
                        className="flex items-center p-5 rounded-xl border border-gray-200 bg-white relative"
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
