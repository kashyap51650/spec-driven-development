interface DashboardHeaderProps {
  label: string;
}

export function DashboardHeader({ label }: DashboardHeaderProps): React.JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Overview for {label}</p>
    </div>
  );
}
