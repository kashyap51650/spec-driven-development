"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { IncomeForm } from "./IncomeForm";

interface CreateIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIncomeDialog({ open, onOpenChange }: CreateIncomeDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <IncomeForm mode="create" onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
