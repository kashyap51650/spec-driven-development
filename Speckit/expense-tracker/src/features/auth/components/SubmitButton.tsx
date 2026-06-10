"use client";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  pending: boolean;
  label: string;
}

export function SubmitButton({ pending, label }: SubmitButtonProps): React.ReactElement {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Loading..." : label}
    </Button>
  );
}
