import { Bell, LogOut, Settings, User } from "lucide-react";
import TimerWidget from "@/components/time-tracking/timer-widget";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

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
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const pageTitle = getPageTitle(location);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      setLocation('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout"
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-foreground" data-testid="page-title">
          {pageTitle}
        </h2>
        <span className="text-sm text-muted-foreground" data-testid="welcome-message">
          Welcome back, {user?.firstName || user?.username || 'User'}
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
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 hover-elevate active-elevate-2 rounded-md px-2 py-1" data-testid="user-profile">
              <Avatar className="w-8 h-8">
                {user?.avatar && <AvatarImage src={user.avatar} alt="Profile" />}
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{getUserDisplayName()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-settings">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-settings-admin">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout" className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
