import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, File, CalendarPlus } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      id: "new-case",
      label: "New Case",
      icon: Plus,
      color: "bg-primary text-primary-foreground hover:bg-primary/90",
      action: () => setLocation("/cases"),
    },
    {
      id: "add-client",
      label: "Add Client",
      icon: UserPlus,
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      action: () => setLocation("/clients"),
    },
    {
      id: "generate-invoice",
      label: "Generate Invoice",
      icon: File,
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      action: () => setLocation("/invoicing"),
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: CalendarPlus,
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      action: () => setLocation("/calendar"),
    },
  ];

  return (
    <Card data-testid="quick-actions-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={action.action}
              className={`w-full justify-start space-x-3 p-3 ${action.color} transition-colors`}
              data-testid={`quick-action-${action.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{action.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
