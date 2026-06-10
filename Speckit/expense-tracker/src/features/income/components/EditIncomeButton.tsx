"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Income } from "@/types/income";

import { EditIncomeDialog } from "./EditIncomeDialog";

interface EditIncomeButtonProps {
  income: Income;
}

export function EditIncomeButton({ income }: EditIncomeButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <EditIncomeDialog income={income} open={open} onOpenChange={setOpen} />
    </>
  );
}
