
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import {
  Shield,
  FilePlus,
  FileText,
  Upload,
  Edit,
  Trash2,
  HelpCircle,
  Save,
  PlusCircle,
  FileUp,
} from "lucide-react";
import ElectoralPlanForm from "@/components/admin/ElectoralPlanForm";
import QuizQuestionForm from "@/components/admin/QuizQuestionForm";
import AdminAuth from "@/components/admin/AdminAuth";
import PdfUploadDialog from "@/components/admin/PdfUploadDialog";

// Mock data for demonstration purposes
const MOCK_PLANS = [
  {
    id: 1,
    candidateName: "Alexandra Johnson",
    party: "Progressive Party",
    summary: "Comprehensive healthcare reform and climate action plan.",
    topics: ["Healthcare", "Environment", "Education"],
    proposals: "Detailed proposals for universal healthcare and renewable energy investments.",
    originalPdf: null,
  },
  {
    id: 2,
    candidateName: "Michael Reynolds",
    party: "Conservative Alliance",
    summary: "Tax reform and small government initiatives.",
    topics: ["Economy", "Defense", "Immigration"],
    proposals: "Proposals for tax cuts and strengthening border security.",
    originalPdf: null,
  },
];

const MOCK_QUESTIONS = [
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
];

// In a real app, this should be a secure check
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [electoralPlans, setElectoralPlans] = useState(MOCK_PLANS);
  const [quizQuestions, setQuizQuestions] = useState(MOCK_QUESTIONS);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("electoral-plans");
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  // Authentication handler
  const handleAuthentication = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      toast.success("Successfully authenticated as admin");
    }
  };

  // Electoral plan handlers
  const handleSavePlan = (planData: any) => {
    if (editingPlan) {
      // Update existing plan
      setElectoralPlans(
        electoralPlans.map((plan) =>
          plan.id === editingPlan.id ? { ...planData, id: plan.id } : plan
        )
      );
      toast.success("Electoral plan updated successfully");
    } else {
      // Add new plan
      setElectoralPlans([
        ...electoralPlans,
        { ...planData, id: Date.now() }
      ]);
      toast.success("New electoral plan added successfully");
    }
    setEditingPlan(null);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setActiveTab("electoral-plans");
  };

  const handleDeletePlan = (id: number) => {
    setElectoralPlans(electoralPlans.filter((plan) => plan.id !== id));
    toast.success("Electoral plan deleted successfully");
  };

  // PDF processing handler
  const handlePdfProcessed = (data: any) => {
    const newPlan = {
      ...data,
      id: Date.now(),
    };
    
    setElectoralPlans([...electoralPlans, newPlan]);
  };

  // Quiz question handlers
  const handleSaveQuestion = (questionData: any) => {
    if (editingQuestion) {
      // Update existing question
      setQuizQuestions(
        quizQuestions.map((question) =>
          question.id === editingQuestion.id ? { ...questionData, id: question.id } : question
        )
      );
      toast.success("Quiz question updated successfully");
    } else {
      // Add new question
      setQuizQuestions([
        ...quizQuestions,
        { ...questionData, id: Date.now() }
      ]);
      toast.success("New quiz question added successfully");
    }
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setActiveTab("quiz-questions");
  };

  const handleDeleteQuestion = (id: number) => {
    setQuizQuestions(quizQuestions.filter((question) => question.id !== id));
    toast.success("Quiz question deleted successfully");
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="text-election-blue w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage electoral plans and quiz questions for the Transparent Election platform.
            </p>
          </motion.div>

          {!isAuthenticated ? (
            <AdminAuth onAuthenticate={handleAuthentication} />
          ) : (
            <div className="neo-card p-6">
              <Tabs defaultValue="electoral-plans" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="electoral-plans">Electoral Plans</TabsTrigger>
                  <TabsTrigger value="quiz-questions">Quiz Questions</TabsTrigger>
                </TabsList>

                <TabsContent value="electoral-plans">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Electoral Plans</h2>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setIsPdfDialogOpen(true)} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FileUp size={16} />
                        Upload PDF
                      </Button>
                      <Button onClick={() => setEditingPlan({})} className="flex items-center gap-2">
                        <FilePlus size={16} />
                        Add Manually
                      </Button>
                    </div>
                  </div>

                  {editingPlan ? (
                    <ElectoralPlanForm
                      initialData={editingPlan}
                      onSave={handleSavePlan}
                      onCancel={() => setEditingPlan(null)}
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {electoralPlans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell className="font-medium">{plan.candidateName}</TableCell>
                              <TableCell>{plan.party}</TableCell>
                              <TableCell className="max-w-md truncate">{plan.summary}</TableCell>
                              <TableCell>
                                {plan.originalPdf ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    <FileText size={14} className="text-red-500" />
                                    {plan.originalPdf}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Manual entry</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditPlan(plan)}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 size={16} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this electoral plan? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz-questions">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Quiz Questions</h2>
                    <Button onClick={() => setEditingQuestion({})} className="flex items-center gap-2">
                      <HelpCircle size={16} />
                      Add New Question
                    </Button>
                  </div>

                  {editingQuestion ? (
                    <QuizQuestionForm
                      initialData={editingQuestion}
                      onSave={handleSaveQuestion}
                      onCancel={() => setEditingQuestion(null)}
                    />
                  ) : (
                    <div className="space-y-6">
                      {quizQuestions.map((question) => (
                        <div key={question.id} className="neo-card p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium">{question.question}</h3>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit size={16} />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 size={16} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this quiz question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="pl-4 border-l-2 border-gray-200 mt-3">
                            <ul className="space-y-2">
                              {question.options.map((option: any) => (
                                <li key={option.id} className="flex items-start gap-2">
                                  <span className="font-medium">{option.id})</span>
                                  <div>
                                    <p>{option.text}</p>
                                    <p className="text-xs text-gray-500">Alignment: {option.alignment}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </section>

      <PdfUploadDialog 
        open={isPdfDialogOpen}
        onOpenChange={setIsPdfDialogOpen}
        onPdfProcessed={handlePdfProcessed}
      />
    </div>
  );
};

export default Admin;
