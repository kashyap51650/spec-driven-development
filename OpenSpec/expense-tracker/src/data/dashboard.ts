import { getSession } from "@/lib/auth";
import * as dashboardService from "@/server/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await dashboardService.getDashboardData(session.userId as string);
}
