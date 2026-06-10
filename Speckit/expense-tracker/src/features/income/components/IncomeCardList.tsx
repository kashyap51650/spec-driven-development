import type { Income } from "@/types/income";

import { IncomeCard } from "./IncomeCard";

interface IncomeCardListProps {
  incomes: Income[];
}

export function IncomeCardList({ incomes }: IncomeCardListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 block md:hidden">
      {incomes.map((income) => (
        <IncomeCard key={income.id} income={income} />
      ))}
    </div>
  );
}
