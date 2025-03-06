"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useExpenses } from "@/hooks/useExpenses";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.string(),
  category: z
    .enum(["FOOD", "ENTERTAINMENT", "UTILITIES", "TRANSPORT", "OTHER"])
    .default("OTHER"),
  date: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const EditExpense = ({ fdata }: { fdata: any }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: fdata.description,
      amount: fdata.amount.toString(),
      category: fdata.category,
      date: fdata.date,
    },
  });

  const { updateExpense } = useExpenses();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await updateExpense(fdata.id, {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
      });
      if (res.id) {
        toast({
          title: "Success",
        });
        form.reset();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="Enter Amount" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={fdata.category} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[200px] bg-input rounded-lg">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="w-[200px] bg-input rounded-lg items-center">
                    <SelectItem value="FOOD">FOOD</SelectItem>
                    <SelectItem value="ENTERTAINMENT">ENTERTAINMENT</SelectItem>
                    <SelectItem value="UTILITIES">UTILITIES</SelectItem>
                    <SelectItem value="TRANSPORT">TRANSPORT</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={() => field.onChange(new Date().toDateString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default EditExpense;
