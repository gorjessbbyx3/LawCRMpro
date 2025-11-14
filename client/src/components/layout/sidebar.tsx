import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  Clock, 
  File, 
  MessageSquare, 
  Bot, 
  ChartBar, 
  Shield,
  Scale
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/cases", label: "Cases", icon: Briefcase },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/time-tracking", label: "Time Tracking", icon: Clock },
  { href: "/invoicing", label: "Invoicing", icon: File },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/reports", label: "Reports", icon: ChartBar },
  { href: "/compliance", label: "HI Compliance", icon: Shield },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Scale className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl font-bold text-foreground">LegalCRM Pro</h1>
            <p className="text-sm text-muted-foreground">Hawaii Law Practice</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2" data-testid="sidebar-navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.label === "Messages" && unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full ml-auto" data-testid="unread-badge">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
