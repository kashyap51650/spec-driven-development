"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TransfersError({ error, reset }: ErrorProps): React.ReactElement {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-destructive text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="text-sm underline underline-offset-4 hover:no-underline"
      >
        Try again
      </button>
    </div>
  );
}
