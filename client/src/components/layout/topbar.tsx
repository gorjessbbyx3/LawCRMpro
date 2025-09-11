import { Bell } from "lucide-react";
import TimerWidget from "@/components/time-tracking/timer-widget";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

// Get page title from location
const getPageTitle = (location: string) => {
  const routeTitles: Record<string, string> = {
    "/": "Dashboard",
    "/clients": "Clients",
    "/cases": "Cases",
    "/calendar": "Calendar",
    "/documents": "Documents",
    "/time-tracking": "Time Tracking",
    "/invoicing": "Invoicing",
    "/messages": "Messages",
    "/ai-assistant": "AI Assistant",
    "/reports": "Reports",
    "/compliance": "HI Compliance",
  };
  
  return routeTitles[location] || "Dashboard";
};

export default function TopBar() {
  const [location] = useLocation();
  const pageTitle = getPageTitle(location);

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-foreground" data-testid="page-title">
          {pageTitle}
        </h2>
        <span className="text-sm text-muted-foreground" data-testid="welcome-message">
          Welcome back, Attorney Johnson
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <TimerWidget />
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="notification-bell"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              5
            </span>
          </button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3" data-testid="user-profile">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40" alt="Attorney Profile" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">Attorney Johnson</span>
        </div>
      </div>
    </header>
  );
}
