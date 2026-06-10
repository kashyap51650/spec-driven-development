"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateExpenseDialog from "./CreateExpenseDialog";

export default function CreateExpenseButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Expense</Button>
      <CreateExpenseDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
