
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
import { X, Save, PlusCircle, Trash2 } from "lucide-react";

const optionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  text: z.string().min(1, "Option text is required"),
  alignment: z.string().min(1, "Alignment is required"),
});

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(optionSchema).min(2, "At least 2 options are required"),
});

interface QuizQuestionFormProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const QuizQuestionForm: React.FC<QuizQuestionFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  // Initialize options array
  const [options, setOptions] = useState<Array<{ id: string; text: string; alignment: string }>>(
    initialData.options || [
      { id: "a", text: "", alignment: "progressive" },
      { id: "b", text: "", alignment: "moderate" },
      { id: "c", text: "", alignment: "conservative" },
    ]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: initialData.question || "",
      options: options,
    },
  });

  // Update form when options change
  React.useEffect(() => {
    form.setValue("options", options);
  }, [options, form]);

  const addOption = () => {
    // Generate next option ID (a, b, c, ... z)
    const lastId = options.length > 0 ? options[options.length - 1].id : "a";
    const nextId = String.fromCharCode(lastId.charCodeAt(0) + 1);
    
    setOptions([...options, { id: nextId, text: "", alignment: "moderate" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return; // Keep at least 2 options
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your quiz question" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Answer Options</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addOption}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add Option
            </Button>
          </div>

          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="w-12 flex-shrink-0">
                  <Input
                    value={option.id}
                    onChange={(e) => updateOption(index, "id", e.target.value)}
                    placeholder="ID"
                    className="text-center"
                  />
                </div>
                
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(index, "text", e.target.value)}
                    placeholder="Option text"
                    className="mb-2"
                  />
                  
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500">Alignment:</span>
                    <select
                      value={option.alignment}
                      onChange={(e) => updateOption(index, "alignment", e.target.value)}
                      className="text-sm p-1 border rounded"
                    >
                      <option value="progressive">Progressive</option>
                      <option value="moderate">Moderate</option>
                      <option value="conservative">Conservative</option>
                    </select>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          
          {form.formState.errors.options && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.options.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} className="mr-2" />
            Save Question
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuizQuestionForm;
