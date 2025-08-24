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
import { chooseFileDialog, readFileBinary } from "@/lib/helpers/file";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAPIKey } from "@/lib/helpers/api";
import { fetch } from "@tauri-apps/plugin-http";

const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  urgency: z.string().min(1, "Please select urgency level"),
  impact: z.string().min(1, "Please select impact level"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email is required").min(1, "Email is required"),
  phone: z.string().min(10, "Phone # is required"),
  screenshot: z.string().optional(),
});

type FormDataC = z.infer<typeof formSchema>;

export default function Support() {
  const [file, setFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormDataC>({
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

  useEffect(() => {
    const loadAPIKey = async () => {
      await getAPIKey();
    };

    loadAPIKey();
  }, []);

  const handleFileSelect = async () => {
    const filePath = await chooseFileDialog();
    setFile(filePath);
    form.setValue("screenshot", filePath || "");
  };

  function uint8ToBase64(uint8Array: Uint8Array): string {
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  const onSubmit = async (data: FormDataC) => {
    try {
      setIsSubmitting(true);
      const apiKey = await getAPIKey();
      if (!apiKey) {
        throw "Failed to find API Key";
      }

      const screenshot = data.screenshot
        ? await readFileBinary(data.screenshot)
        : null;

      const imageBase64 = screenshot ? uint8ToBase64(screenshot) : null;

      const res = await fetch(
        "http://192.168.1.112:3000/api/agent/tickets/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            ...data,
            screenshot: imageBase64,
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw `HTTP ${res.status}: ${errText}`;
      }

      const body = await res.json();
      alert(`Support ticket created successfully! Ticket ID: ${body.ticketId}`);

      // Reset form
      form.reset();
      setFile(null);
    } catch (error: any) {
      Object.entries(error).forEach(([key, value]) => {
        console.error(`${key}: ${value}`);
      });
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
