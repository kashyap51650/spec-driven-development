"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreateExpenseDialog } from "./CreateExpenseDialog";

export function CreateExpenseButton(): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Expense</Button>
      <CreateExpenseDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
