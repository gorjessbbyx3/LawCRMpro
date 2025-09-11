import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const deadlines = [
  {
    id: "1",
    title: "Motion to Dismiss Filing",
    case: "Case #2024-001",
    dueDate: "Tomorrow",
    timeLeft: "16 hours left",
    urgency: "critical",
    color: "bg-red-50 border-red-200",
    textColor: "text-red-600",
  },
  {
    id: "2",
    title: "Discovery Response",
    case: "Case #2024-002",
    dueDate: "Nov 28",
    timeLeft: "3 days left",
    urgency: "warning",
    color: "bg-orange-50 border-orange-200",
    textColor: "text-orange-600",
  },
  {
    id: "3",
    title: "Client Meeting Prep",
    case: "Estate Planning Review",
    dueDate: "Dec 2",
    timeLeft: "1 week left",
    urgency: "normal",
    color: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-600",
  },
];

export default function UpcomingDeadlines() {
  return (
    <Card data-testid="upcoming-deadlines-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Deadlines</CardTitle>
          <Badge variant="destructive" className="text-xs" data-testid="critical-count">
            3 Critical
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((deadline) => (
          <div
            key={deadline.id}
            className={`flex items-center justify-between p-3 border rounded-lg ${deadline.color}`}
            data-testid={`deadline-item-${deadline.id}`}
          >
            <div>
              <p className="text-sm font-medium text-foreground" data-testid={`deadline-title-${deadline.id}`}>
                {deadline.title}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`deadline-case-${deadline.id}`}>
                {deadline.case}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${deadline.textColor}`} data-testid={`deadline-due-${deadline.id}`}>
                {deadline.dueDate}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`deadline-time-left-${deadline.id}`}>
                {deadline.timeLeft}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
