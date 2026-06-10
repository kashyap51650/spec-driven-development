interface DashboardHeaderProps {
  currentMonth: string;
}

export default function DashboardHeader({ currentMonth }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Overview for {currentMonth}</p>
    </div>
  );
}
