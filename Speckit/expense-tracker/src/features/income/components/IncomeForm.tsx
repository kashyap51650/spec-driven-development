"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { type Resolver, Controller, useForm } from "react-hook-form";

import { createIncomeAction, updateIncomeAction } from "@/actions/income.actions";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACCOUNT_TYPES } from "@/constants/expense";
import { INCOME_SOURCES } from "@/constants/income";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import {
  type CreateIncomeInput,
  createIncomeSchema,
} from "@/server/validations/income.validation";
import type { Income } from "@/types/income";
import { formatDate } from "@/utils/formatDate";

interface IncomeFormProps {
  mode: "create" | "edit";
  income?: Income;
  onSuccess: () => void;
}

export function IncomeForm({ mode, income, onSuccess }: IncomeFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIncomeInput>({
    resolver: zodResolver(createIncomeSchema) as Resolver<CreateIncomeInput>,
    defaultValues:
      mode === "edit" && income
        ? {
            title: income.title,
            amount: income.amount,
            source: income.source as CreateIncomeInput["source"],
            account: income.account as CreateIncomeInput["account"],
            date: income.date,
            notes: income.notes ?? "",
          }
        : {},
  });

  function onSubmit(data: CreateIncomeInput): void {
    setFormError(null);
    const fd = new FormData();
    fd.set("title", data.title);
    fd.set("amount", String(data.amount));
    fd.set("source", data.source);
    fd.set("account", data.account);
    fd.set("date", data.date.toISOString());
    fd.set("notes", data.notes ?? "");

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createIncomeAction(fd)
          : await updateIncomeAction(income!.id, fd);

      if (result.success) {
        onSuccess();
      } else {
        setFormError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="e.g. Freelance project" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Source</Label>
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((src) => (
                  <SelectItem key={src} value={src}>
                    {src}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.source && <p className="text-sm text-destructive">{errors.source.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Account</Label>
        <Controller
          control={control}
          name="account"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((acc) => (
                  <SelectItem key={acc} value={acc}>
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.account && <p className="text-sm text-destructive">{errors.account.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger className="flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm hover:bg-accent hover:text-accent-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? formatDate(field.value) : "Pick a date"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Optional notes" />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <SubmitButton pending={isPending} label={mode === "create" ? "Add Income" : "Save Changes"} />
    </form>
  );
}
