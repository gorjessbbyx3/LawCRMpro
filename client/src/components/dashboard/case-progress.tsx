import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Case } from "@shared/schema";

export default function CaseProgress() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["/api/cases"],
  });

  // Show only active cases, limited to 3 for dashboard
  const activeCases = cases
    .filter((caseItem: Case) => caseItem.status === "active")
    .slice(0, 3);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card data-testid="case-progress-card">
        <CardHeader>
          <CardTitle>Active Case Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="case-progress-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Case Progress</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All Cases
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCases.length === 0 ? (
          <p className="text-muted-foreground text-center py-4" data-testid="no-active-cases">
            No active cases found.
          </p>
        ) : (
          activeCases.map((caseItem: Case) => (
            <div 
              key={caseItem.id} 
              className="p-4 border border-border rounded-lg"
              data-testid={`case-progress-item-${caseItem.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground" data-testid={`case-title-${caseItem.id}`}>
                  {caseItem.title}
                </h4>
                <Badge variant={getStatusVariant(caseItem.status)} data-testid={`case-status-${caseItem.id}`}>
                  {caseItem.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3" data-testid={`case-info-${caseItem.id}`}>
                {caseItem.caseType?.replace('_', ' ')} • Case #{caseItem.caseNumber}
              </p>
              
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium text-foreground" data-testid={`case-progress-${caseItem.id}`}>
                  {caseItem.progress || 0}%
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(caseItem.progress || 0)}`}
                  style={{ width: `${caseItem.progress || 0}%` }}
                ></div>
              </div>
              
              {caseItem.nextAction && (
                <p className="text-xs text-muted-foreground" data-testid={`case-next-action-${caseItem.id}`}>
                  Next: {caseItem.nextAction}
                  {caseItem.nextActionDue && ` due ${new Date(caseItem.nextActionDue).toLocaleDateString()}`}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
