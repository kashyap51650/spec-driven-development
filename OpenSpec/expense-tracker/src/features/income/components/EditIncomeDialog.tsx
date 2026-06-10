"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IncomeForm from "./IncomeForm";
import type { Income } from "@/types/income";

export default function EditIncomeDialog({
  open,
  onOpenChange,
  income,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  income: Income;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
        </DialogHeader>
        <IncomeForm
          mode="edit"
          income={income}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
