"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreateIncomeDialog } from "./CreateIncomeDialog";

export function CreateIncomeButton(): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Income</Button>
      <CreateIncomeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
