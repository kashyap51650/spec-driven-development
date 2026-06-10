import { Skeleton } from "@/components/ui/skeleton";

export default function IncomeLoading(): React.ReactElement {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
        <Skeleton className="h-12 rounded-md" />
      </div>
    </div>
  );
}
