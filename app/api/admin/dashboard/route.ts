import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalApprenants, totalCreateurs, totalEntrepreneurs, totalHybrides, totalCoaches,
      newUsersThisMonth, publishedContents, pendingContents, totalContents,
      newContentsThisMonth, activeSubscriptions, newSubscriptionsThisMonth,
      pendingRoleUpgrades, completedPurchases,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "APPRENANT" } }),
      prisma.user.count({ where: { role: "CREATEUR" } }),
      prisma.user.count({ where: { role: "ENTREPRENEUR" } }),
      prisma.user.count({ where: { role: "HYBRIDE" } }),
      prisma.user.count({ where: { role: "COACH" } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.content.count({ where: { status: "APPROVED" } }),
      prisma.content.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.content.count(),
      prisma.content.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.userSubscription.count({ where: { status: "ACTIVE", endDate: { gt: now } } }),
      prisma.userSubscription.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.roleUpgradeRequest.count({ where: { status: "PENDING" } }),
      prisma.purchase.count({ where: { status: "COMPLETED", createdAt: { gte: startOfMonth } } }),
    ]);

    const totalRevenue = await prisma.purchase.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } });
    const revenueThisMonth = await prisma.purchase.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfMonth } }, _sum: { amount: true } });

    return success({
      totalUsers: totalApprenants + totalCreateurs + totalEntrepreneurs + totalHybrides + totalCoaches,
      newUsersThisMonth,
      activeCreators: totalCreateurs + totalEntrepreneurs + totalHybrides,
      certifiedCoaches: totalCoaches,
      totalContents, publishedContents, pendingContents, newContentsThisMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueThisMonth: revenueThisMonth._sum.amount || 0,
      totalPurchases: completedPurchases,
      activeSubscriptions, newSubscriptionsThisMonth,
      pendingRoleUpgrades, pendingContentApprovals: pendingContents,
    });
  } catch (e) {
    return handleError(e);
  }
}
