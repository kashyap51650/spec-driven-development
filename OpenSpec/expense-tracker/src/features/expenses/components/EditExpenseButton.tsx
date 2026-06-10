"use client";

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types/expense";
import EditExpenseDialog from "./EditExpenseDialog";

export default function EditExpenseButton({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <EditExpenseDialog open={open} onOpenChange={setOpen} expense={expense} />
    </>
  );
}
