"use client";

import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditIncomeDialog from "./EditIncomeDialog";
import type { Income } from "@/types/income";

export default function EditIncomeButton({ income }: { income: Income }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <EditIncomeDialog open={open} onOpenChange={setOpen} income={income} />
    </>
  );
}
