"use client";

import { CalendarIcon, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INCOME_SOURCES } from "@/constants/income";
import { formatDate } from "@/utils/formatDate";

interface IncomeFiltersBarProps {
  source?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function IncomeFiltersBar({
  source,
  startDate,
  endDate,
  search,
}: IncomeFiltersBarProps): React.JSX.Element {
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

  const hasFilters = !!(source || startDate || endDate || search);

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Input
        placeholder="Search income..."
        defaultValue={search}
        onChange={handleSearchChange}
        className="w-48"
      />

      <Select
        value={source ?? ""}
        onValueChange={(v) => updateParam("source", v || undefined)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Sources</SelectItem>
          {INCOME_SOURCES.map((src) => (
            <SelectItem key={src} value={src}>
              {src}
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
