import { Link, useLocation } from "wouter";
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
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/reports", label: "Reports", icon: ChartBar },
  { href: "/compliance", label: "HI Compliance", icon: Shield },
];

export default function Sidebar() {
  const [location] = useLocation();

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
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full ml-auto">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
