
import React from "react";
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
import { X, Save } from "lucide-react";

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

  return (
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
              <FormLabel>Detailed Proposals</FormLabel>
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
  );
};

export default ElectoralPlanForm;
