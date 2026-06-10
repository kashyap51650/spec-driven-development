"use client";

import React, { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "@/server/validations/income.validation";
import type { CreateIncomeInput, UpdateIncomeInput } from "@/server/validations/income.validation";
import type { Income } from "@/types/income";
import {
  createIncomeAction,
  updateIncomeAction,
} from "@/actions/income.actions";
import { INCOME_SOURCES } from "@/constants/income";
import { ACCOUNT_TYPES } from "@/constants/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  mode: "create" | "edit";
  income?: Income;
  onSuccess: () => void;
};

type FormValues = CreateIncomeInput | UpdateIncomeInput;

export default function IncomeForm({ mode, income, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const schema = mode === "create" ? createIncomeSchema : updateIncomeSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: income
      ? {
          title: income.title,
          amount: income.amount,
          source: income.source,
          account: income.account,
          date: new Date(income.date).toISOString().slice(0, 10) as unknown as Date,
          notes: income.notes ?? "",
        }
      : undefined,
  });

  const onSubmit = async (values: FormValues) => {
    setActionError(null);
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v instanceof Date) {
        formData.append(k, v.toISOString());
      } else {
        formData.append(k, v == null ? "" : String(v));
      }
    });

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createIncomeAction(formData)
          : income
            ? await updateIncomeAction(income.id, formData)
            : { success: false, message: "Missing income id" };

      if (result.success) {
        onSuccess();
      } else {
        setActionError(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
      <div>
        <Input placeholder="Title" {...register("title")} />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Input
          type="number"
          step="0.01"
          placeholder="Amount"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <Select value={field.value as string | undefined} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.source && (
          <p className="mt-1 text-sm text-red-500">{errors.source.message}</p>
        )}
      </div>

      <div>
        <Controller
          name="account"
          control={control}
          render={({ field }) => (
            <Select value={field.value as string | undefined} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.account && (
          <p className="mt-1 text-sm text-red-500">{errors.account.message}</p>
        )}
      </div>

      <div>
        <Input type="date" {...register("date")} />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div>
        <Textarea placeholder="Notes" {...register("notes")} />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {actionError && (
        <p className="text-sm text-red-500">{actionError}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}
