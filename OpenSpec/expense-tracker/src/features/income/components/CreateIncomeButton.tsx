"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateIncomeDialog from "./CreateIncomeDialog";

export default function CreateIncomeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Income</Button>
      <CreateIncomeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
