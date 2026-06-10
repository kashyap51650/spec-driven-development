import { EmptyState } from "@/components/shared/EmptyState";
import { getIncomes } from "@/data/income";
import type { IncomeFilters } from "@/types/income";

import { CreateIncomeButton } from "@/features/income/components/CreateIncomeButton";
import { IncomeCardList } from "@/features/income/components/IncomeCardList";
import { IncomeFiltersBar } from "@/features/income/components/IncomeFiltersBar";
import { IncomeTable } from "@/features/income/components/IncomeTable";

interface IncomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps): Promise<React.JSX.Element> {
  const params = await searchParams;

  const filters: IncomeFilters = {
    source: params.source,
    startDate: params.startDate,
    endDate: params.endDate,
    search: params.search,
  };

  const incomes = await getIncomes(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Income</h1>
        <CreateIncomeButton />
      </div>

      <IncomeFiltersBar
        source={filters.source}
        startDate={filters.startDate}
        endDate={filters.endDate}
        search={filters.search}
      />

      {incomes.length === 0 ? (
        <EmptyState
          title="No income yet"
          description="Track your earnings by adding your first income record."
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
