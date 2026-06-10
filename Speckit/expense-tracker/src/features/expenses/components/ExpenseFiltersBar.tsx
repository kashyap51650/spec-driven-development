"use client";

import { CalendarIcon, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/constants/expense";
import { formatDate } from "@/utils/formatDate";

interface ExpenseFiltersBarProps {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function ExpenseFiltersBar({
  category,
  startDate,
  endDate,
  search,
}: ExpenseFiltersBarProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string | undefined): void {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateParam("search", value || undefined);
    }, 400);
  }

  const hasFilters = !!(category || startDate || endDate || search);

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Input
        placeholder="Search expenses..."
        defaultValue={search}
        onChange={handleSearchChange}
        className="w-48"
      />

      <Select
        value={category ?? ""}
        onValueChange={(v) => updateParam("category", v || undefined)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {EXPENSE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger className="flex h-9 w-36 items-center justify-start rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm hover:bg-accent hover:text-accent-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate ? formatDate(new Date(startDate)) : "From"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate ? new Date(startDate) : undefined}
            onSelect={(d) => updateParam("startDate", d?.toISOString())}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger className="flex h-9 w-36 items-center justify-start rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-sm hover:bg-accent hover:text-accent-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {endDate ? formatDate(new Date(endDate)) : "To"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate ? new Date(endDate) : undefined}
            onSelect={(d) => updateParam("endDate", d?.toISOString())}
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" onClick={() => router.push(pathname)} className="flex items-center gap-1">
          <X className="h-4 w-4" />
          Clear all
        </Button>
      )}
    </div>
  );
}
