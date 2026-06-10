"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Income } from "@/types/income";

import { IncomeForm } from "./IncomeForm";

interface EditIncomeDialogProps {
  income: Income;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIncomeDialog({ income, open, onOpenChange }: EditIncomeDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
        </DialogHeader>
        <IncomeForm mode="edit" income={income} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
