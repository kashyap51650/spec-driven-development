import React from "react";
import { getIncomes } from "@/data/income";
import EmptyState from "@/components/shared/EmptyState";
import CreateIncomeButton from "@/features/income/components/CreateIncomeButton";
import IncomeFiltersBar from "@/features/income/components/IncomeFiltersBar";
import IncomeTable from "@/features/income/components/IncomeTable";
import IncomeCardList from "@/features/income/components/IncomeCardList";
import type { IncomeFilters } from "@/types/income";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}): Promise<React.ReactNode> {
  const { source, startDate, endDate, search } = await searchParams;

  const filters: IncomeFilters = {};
  if (source) filters.source = source;
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);
  if (search) filters.search = search;

  const incomes = await getIncomes(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Income</h1>
        <CreateIncomeButton />
      </div>

      <IncomeFiltersBar
        source={source}
        startDate={startDate}
        endDate={endDate}
        search={search}
      />

      {incomes.length === 0 ? (
        <EmptyState
          title="No income"
          description="You have no income records. Add one to get started."
          action={<CreateIncomeButton />}
        />
      ) : (
        <>
          <IncomeTable incomes={incomes} />
          <IncomeCardList incomes={incomes} />
        </>
      )}
    </div>
  );
}
