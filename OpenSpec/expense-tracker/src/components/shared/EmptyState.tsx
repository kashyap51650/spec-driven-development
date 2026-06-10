import React from "react";
import { Inbox } from "lucide-react";

interface Props {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-muted-foreground mb-4">
        <Inbox className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
