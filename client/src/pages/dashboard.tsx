import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/dashboard/metric-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import CaseProgress from "@/components/dashboard/case-progress";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg border border-border animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Active Cases"
          value={metrics?.activeCases || 0}
          change="+3 this month"
          trend="up"
          icon="briefcase"
          color="blue"
        />
        <MetricCard
          title="Revenue (MTD)"
          value={`$${metrics?.monthlyRevenue || "0"}`}
          change="+12% vs last month"
          trend="up"
          icon="dollar-sign"
          color="green"
        />
        <MetricCard
          title="Billable Hours"
          value={metrics?.billableHours || 0}
          change="-5 vs target"
          trend="down"
          icon="clock"
          color="orange"
        />
        <MetricCard
          title="Court Dates"
          value={metrics?.upcomingCourtDates || 0}
          change={`${metrics?.upcomingCourtDates || 0} this week`}
          trend={metrics?.upcomingCourtDates > 0 ? "warning" : "neutral"}
          icon="gavel"
          color="red"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <QuickActions />
      </div>

      {/* Upcoming Deadlines & Case Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines />
        <CaseProgress />
      </div>
    </div>
  );
}
