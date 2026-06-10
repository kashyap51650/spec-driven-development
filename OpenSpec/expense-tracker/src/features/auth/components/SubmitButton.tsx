"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  pending?: boolean;
  children?: React.ReactNode;
};

export default function SubmitButton({ pending = false, children }: Props) {
  return (
    <Button type="submit" disabled={pending} variant="default">
      {pending ? "Loading..." : children}
    </Button>
  );
}
