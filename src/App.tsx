"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { chooseFileDialog } from "@/lib/helpers/file";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  urgency: z.string().min(1, "Please select urgency level"),
  impact: z.string().min(1, "Please select impact level"),
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required"),
  phone: z.string().min(1, "Phone # is required"),
  screenshot: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function App() {
  const [file, setFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      description: "",
      urgency: "none",
      impact: "single",
      name: "",
      email: "",
      phone: "",
      screenshot: "",
    },
  });

  const handleFileSelect = async () => {
    const filePath = await chooseFileDialog();
    console.log(filePath);
    setFile(filePath);
    form.setValue("screenshot", filePath || "");
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Mock API call
      console.log("Submitting support ticket with data:", data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful response
      const mockResponse = {
        success: true,
        ticketId: `TICK-${Date.now()}`,
        message: "Support ticket created successfully",
        data: data,
      };

      console.log("API Response:", mockResponse);
      alert(
        `Support ticket created successfully! Ticket ID: ${mockResponse.ticketId}`
      );

      // Reset form
      form.reset();
      setFile(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col w-screen h-screen gap-2 p-4 items-center justify-center">
      <h1 className="flex gap-2 py-4 text-4xl text-center items-center">
        <span className="text-6xl text-primary">Centriserve IT</span>
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 size-full"
        >
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary of the issue *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell us about the issue (Optional)</FormLabel>
                <FormControl>
                  <Textarea className="h-20 resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>How urgent is your request?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not urgent</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Who is impacted?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Only me</SelectItem>
                        <SelectItem value="unknown">Don't know</SelectItem>
                        <SelectItem value="multiple">Others</SelectItem>
                        <SelectItem value="all">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-8 gap-2 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="123-123-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FormLabel>Screenshot (Optional)</FormLabel>
            <Button type="button" variant="outline" onClick={handleFileSelect}>
              {file ? file : "Choose File"}
            </Button>
          </div>

          <div className="mt-auto">
            <Button type="submit" className="w-24" disabled={isSubmitting}>
              {isSubmitting ? "..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default App;
