"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Expense } from "@/types/expense";

import { EditExpenseDialog } from "./EditExpenseDialog";

interface EditExpenseButtonProps {
  expense: Expense;
}

export function EditExpenseButton({ expense }: EditExpenseButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <EditExpenseDialog expense={expense} open={open} onOpenChange={setOpen} />
    </>
  );
}
