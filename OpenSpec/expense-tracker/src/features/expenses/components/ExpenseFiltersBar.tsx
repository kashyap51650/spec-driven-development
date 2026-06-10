"use client";

import React, { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/constants/expense";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function setSearchParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const url = new URL(window.location.href);
  const sp = new URLSearchParams(url.search);
  Object.keys(params).forEach((k) => {
    const v = params[k as keyof typeof params];
    if (v) sp.set(k, v);
    else sp.delete(k);
  });
  router.replace(`${pathname}?${sp.toString()}`);
}

export default function ExpenseFiltersBar({
  category,
  startDate,
  endDate,
  search,
}: {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<number | null>(null);

  function handleChange(updates: Record<string, string | undefined>) {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(
      () => setSearchParams(router, pathname, updates),
      400,
    );
  }

  const hasFilters = !!(category || startDate || endDate || search);

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          defaultValue={search ?? ""}
          placeholder="Search title"
          className="pl-8 w-45"
          onChange={(e) => handleChange({ search: e.target.value })}
        />
      </div>

      <Select
        value={category || undefined}
        onValueChange={(val) =>
          setSearchParams(router, pathname, { category: val || undefined })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          {EXPENSE_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        defaultValue={startDate ?? ""}
        type="date"
        className="w-37.5"
        onChange={(e) =>
          handleChange({ startDate: e.target.value || undefined })
        }
      />
      <Input
        defaultValue={endDate ?? ""}
        type="date"
        className="w-37.5"
        onChange={(e) => handleChange({ endDate: e.target.value || undefined })}
      />

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSearchParams(router, pathname, {
              category: undefined,
              startDate: undefined,
              endDate: undefined,
              search: undefined,
            })
          }
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
