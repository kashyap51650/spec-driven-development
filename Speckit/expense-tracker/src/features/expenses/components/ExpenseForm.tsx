"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { type Resolver, Controller, useForm } from "react-hook-form";

import { createExpenseAction, updateExpenseAction } from "@/actions/expense.actions";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ACCOUNT_TYPES, EXPENSE_CATEGORIES } from "@/constants/expense";
import {
  type CreateExpenseInput,
  createExpenseSchema,
} from "@/server/validations/expense.validation";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { formatDate } from "@/utils/formatDate";
import type { Expense } from "@/types/expense";

interface ExpenseFormProps {
  mode: "create" | "edit";
  expense?: Expense;
  onSuccess: () => void;
}

export function ExpenseForm({ mode, expense, onSuccess }: ExpenseFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as Resolver<CreateExpenseInput>,
    defaultValues:
      mode === "edit" && expense
        ? {
            title: expense.title,
            amount: expense.amount,
            category: expense.category as CreateExpenseInput["category"],
            account: expense.account as CreateExpenseInput["account"],
            date: expense.date,
            notes: expense.notes ?? "",
            tags: expense.tags,
            recurring: expense.recurring,
          }
        : {
            tags: [],
            recurring: false,
          },
  });

  function onSubmit(data: CreateExpenseInput): void {
    setFormError(null);
    const fd = new FormData();
    fd.set("title", data.title);
    fd.set("amount", String(data.amount));
    fd.set("category", data.category);
    fd.set("account", data.account);
    fd.set("date", data.date.toISOString());
    fd.set("notes", data.notes ?? "");
    fd.set("tags", (data.tags ?? []).join(", "));
    fd.set("recurring", String(data.recurring ?? false));

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createExpenseAction(fd)
          : await updateExpenseAction(expense!.id, fd);

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
        <Input id="title" {...register("title")} placeholder="e.g. Coffee" />
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
        <Label>Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
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

      <div className="space-y-1">
        <Label htmlFor="tags">Tags</Label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Input
              id="tags"
              placeholder="food, coffee, morning"
              value={field.value?.join(", ") ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
            />
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="recurring"
          render={({ field }) => (
            <Checkbox
              id="recurring"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="recurring" className="cursor-pointer">
          Recurring expense
        </Label>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <SubmitButton pending={isPending} label={mode === "create" ? "Add Expense" : "Save Changes"} />
    </form>
  );
}
