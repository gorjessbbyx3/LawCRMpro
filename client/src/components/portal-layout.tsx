import { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { Scale, Home, Briefcase, FileText, Calendar, MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePortalAuth } from '@/lib/portal-auth';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';

interface PortalLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: 'Dashboard', href: '/portal', icon: Home },
  { title: 'Cases', href: '/portal/cases', icon: Briefcase },
  { title: 'Invoices', href: '/portal/invoices', icon: FileText },
  { title: 'Events', href: '/portal/events', icon: Calendar },
  { title: 'Messages', href: '/portal/messages', icon: MessageSquare },
  { title: 'Profile', href: '/portal/profile', icon: User },
];

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout, isLoading } = usePortalAuth();

  const handleLogout = async () => {
    await logout();
    setLocation('/portal/login');
  };

  if (!user && !isLoading) {
    setLocation('/portal/login');
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <div>
                <p className="font-bold text-sm">Client Portal</p>
                <p className="text-xs text-muted-foreground">LegalCRM Pro</p>
              </div>
            </div>
          </SidebarHeader>
          
          <Separator />
          
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.href || (item.href !== '/portal' && location.startsWith(item.href))}
                  >
                    <Link href={item.href} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            {user && (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                  data-testid="button-portal-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-4 p-3 border-b bg-background">
            <SidebarTrigger data-testid="button-portal-sidebar-toggle" />
            <span className="text-sm font-medium text-muted-foreground">
              {navItems.find(item => location === item.href || (item.href !== '/portal' && location.startsWith(item.href)))?.title || 'Portal'}
            </span>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
