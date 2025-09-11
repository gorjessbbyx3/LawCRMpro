import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, DollarSign } from "lucide-react";

const activities = [
  {
    id: "1",
    title: "Document uploaded: Motion to Dismiss",
    case: "Case #2024-001 - Smith vs. Johnson",
    timestamp: "2 hours ago",
    type: "document",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "2",
    title: "Court date scheduled",
    case: "Case #2024-003 - Estate Planning",
    timestamp: "4 hours ago",
    type: "calendar",
    icon: Calendar,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "3",
    title: "Payment received: $2,500",
    case: "Invoice #INV-2024-045",
    timestamp: "Yesterday",
    type: "payment",
    icon: DollarSign,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function RecentActivity() {
  return (
    <Card data-testid="recent-activity-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-muted rounded-lg fade-in"
              data-testid={`activity-item-${activity.id}`}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${activity.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium" data-testid={`activity-title-${activity.id}`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-case-${activity.id}`}>
                  {activity.case}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
