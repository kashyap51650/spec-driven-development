import React from "react";
import type { Expense } from "@/types/expense";
import ExpenseCard from "./ExpenseCard";

export default function ExpenseCardList({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {expenses.map((e) => (
        <ExpenseCard key={e.id} expense={e} />
      ))}
    </div>
  );
}
