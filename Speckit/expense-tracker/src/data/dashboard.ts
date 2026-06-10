import { getSession } from "@/lib/auth";
import * as dashboardService from "@/server/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return dashboardService.getDashboardData(session.userId);
}
