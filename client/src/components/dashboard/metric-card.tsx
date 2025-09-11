import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Gavel,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "warning";
  icon: "briefcase" | "dollar-sign" | "clock" | "gavel";
  color: "blue" | "green" | "orange" | "red";
}

const iconMap = {
  briefcase: Briefcase,
  "dollar-sign": DollarSign,
  clock: Clock,
  gavel: Gavel,
};

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

export default function MetricCard({ title, value, change, trend, icon, color }: MetricCardProps) {
  const Icon = iconMap[icon];
  
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      case "warning":
        return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-orange-600";
      case "warning":
        return "text-red-600";
    }
  };

  return (
    <Card data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground" data-testid="metric-title">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground" data-testid="metric-value">
              {value}
            </p>
            <p className={`text-sm mt-1 flex items-center space-x-1 ${getTrendColor()}`} data-testid="metric-change">
              {getTrendIcon()}
              <span>{change}</span>
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
