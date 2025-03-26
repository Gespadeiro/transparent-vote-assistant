
import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ShieldAlert } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface AdminAuthProps {
  onAuthenticate: (success: boolean) => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticate }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real application, validate credentials against a secure backend
    // This is just a mock implementation
    const isValid = values.username === "admin" && values.password === "admin123";
    onAuthenticate(isValid);

    if (!isValid) {
      form.setError("password", {
        type: "manual",
        message: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="neo-card p-8 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center mb-6">
        <ShieldAlert className="w-12 h-12 text-election-blue mb-3" />
        <h2 className="text-xl font-semibold">Admin Authentication</h2>
        <p className="text-sm text-gray-600 text-center mt-1">
          Please enter your administrator credentials to access the dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter admin username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6">
            Login to Dashboard
          </Button>
        </form>
      </Form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>For demo purposes, use: username: "admin" / password: "admin123"</p>
      </div>
    </motion.div>
  );
};

export default AdminAuth;
