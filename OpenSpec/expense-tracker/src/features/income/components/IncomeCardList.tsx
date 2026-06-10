import React from "react";
import type { Income } from "@/types/income";
import IncomeCard from "./IncomeCard";

export default function IncomeCardList({ incomes }: { incomes: Income[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {incomes.map((i) => (
        <IncomeCard key={i.id} income={i} />
      ))}
    </div>
  );
}
