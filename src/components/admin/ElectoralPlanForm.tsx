
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Save, Search, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  party: z.string().min(1, "Party name is required"),
  summary: z.string().min(1, "Summary is required"),
  topics: z.string().min(1, "At least one topic is required"),
  proposals: z.string().min(10, "Detailed proposals are required"),
});

interface ElectoralPlanFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ElectoralPlanForm: React.FC<ElectoralPlanFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  // Convert topics array to comma-separated string for form
  const defaultValues = {
    candidateName: initialData.candidateName || "",
    party: initialData.party || "",
    summary: initialData.summary || "",
    topics: Array.isArray(initialData.topics) 
      ? initialData.topics.join(", ") 
      : initialData.topics || "",
    proposals: initialData.proposals || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert comma-separated topics back to array
    const formattedData = {
      ...values,
      topics: values.topics.split(",").map(topic => topic.trim()),
    };
    onSave(formattedData);
  };

  const getDefaultPrompt = (candidateName: string, partyName: string) => {
    return `Provide a summary of key proposals and policy positions for ${candidateName} of the ${partyName} party. Format the response as 4-5 clear, separate bullet points that could be added to an electoral plan database. Each bullet point should focus on a different policy area.`;
  };

  const handleOpenPromptDialog = () => {
    const candidateName = form.getValues("candidateName");
    const partyName = form.getValues("party");
    
    if (!candidateName) {
      toast.error("Please enter a candidate name first");
      return;
    }

    setCustomPrompt(getDefaultPrompt(candidateName, partyName));
    setPromptDialogOpen(true);
  };

  const handleSearch = async () => {
    const candidateName = form.getValues("candidateName");
    const partyName = form.getValues("party");
    
    if (!candidateName) {
      toast.error("Please enter a candidate name first");
      return;
    }

    setSearchQuery(`${candidateName} ${partyName} electoral plan proposals`);
    setIsSearching(true);
    setSearchResults([]);
    setSearchDialogOpen(true);

    try {
      // Call our Supabase edge function for the OpenAI completion
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: {
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that researches political candidates and their electoral plans. Provide factual, concise information about their key proposals and policy positions."
            },
            {
              role: "user",
              content: customPrompt || getDefaultPrompt(candidateName, partyName)
            }
          ],
          temperature: 0.7,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Process the response - split by bullet points or lines
      const content = data.choices[0].message.content;
      const bulletPoints = content
        .split(/•|\n-|\n\*|\n\d+\./)
        .map(point => point.trim())
        .filter(point => point.length > 10);
      
      setSearchResults(bulletPoints);
    } catch (error) {
      console.error("Error searching for candidate information:", error);
      toast.error("Failed to search for candidate information");
      setSearchResults(["Error retrieving information. Please try again."]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToProposals = () => {
    if (!selectedResult) {
      toast.error("Please select information to add");
      return;
    }

    const currentProposals = form.getValues("proposals");
    const updatedProposals = currentProposals 
      ? `${currentProposals}\n\n${selectedResult}` 
      : selectedResult;
    
    form.setValue("proposals", updatedProposals, { shouldDirty: true });
    toast.success("Information added to proposals");
    setSearchDialogOpen(false);
    setSelectedResult("");
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="candidateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter candidate name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Political Party</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter political party" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="A brief summary of the electoral plan" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide a concise summary of the electoral plan (100-200 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topics</FormLabel>
                <FormControl>
                  <Input placeholder="Healthcare, Economy, Education..." {...field} />
                </FormControl>
                <FormDescription>
                  Enter topics separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proposals"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Detailed Proposals</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleOpenPromptDialog}
                          className="flex items-center gap-1"
                        >
                          <Search size={14} />
                          Find Candidate Information
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Search for public information about this candidate's proposals</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of all proposals in the electoral plan" 
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Enter the full text of the proposals or a detailed breakdown
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save size={16} className="mr-2" />
              Save Plan
            </Button>
          </div>
        </form>
      </Form>

      {/* Custom Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customize Search Prompt</DialogTitle>
            <DialogDescription>
              Customize the prompt sent to ChatGPT when searching for candidate information
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[150px]"
              placeholder="Enter your custom prompt for ChatGPT..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              The prompt will automatically include the candidate name and party.
            </p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPromptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setPromptDialogOpen(false);
                handleSearch();
              }}
              className="gap-1"
            >
              <Search size={16} />
              Search with Custom Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Results Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Candidate Information Search</DialogTitle>
            <DialogDescription>
              Searching for: {searchQuery}
            </DialogDescription>
          </DialogHeader>
          
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Searching for candidate information...</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No results found</p>
              ) : (
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Filter results..." />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <CommandGroup heading="Select information to add">
                      {searchResults.map((result, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => setSelectedResult(result)}
                          className={`flex items-start gap-2 p-2 ${
                            selectedResult === result ? "bg-accent" : ""
                          }`}
                        >
                          <div className="flex-1">{result}</div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSearchDialogOpen(false)}
              disabled={isSearching}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToProposals} 
              disabled={!selectedResult || isSearching}
              className="gap-1"
            >
              <PlusCircle size={16} />
              Add to Proposals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ElectoralPlanForm;
