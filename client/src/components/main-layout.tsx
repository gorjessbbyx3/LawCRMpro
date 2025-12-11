import { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  Scale,
  Settings,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/cases', label: 'Cases', icon: Briefcase },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/time-tracking', label: 'Time Tracking', icon: Clock },
  { href: '/invoicing', label: 'Invoicing', icon: File },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/reports', label: 'Reports', icon: ChartBar },
  { href: '/compliance', label: 'HI Compliance', icon: Shield },
];

const getPageTitle = (location: string) => {
  const routeTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/clients': 'Clients',
    '/cases': 'Cases',
    '/calendar': 'Calendar',
    '/documents': 'Documents',
    '/time-tracking': 'Time Tracking',
    '/invoicing': 'Invoicing',
    '/messages': 'Messages',
    '/ai-assistant': 'AI Assistant',
    '/reports': 'Reports',
    '/compliance': 'HI Compliance',
    '/settings': 'Settings',
  };
  return routeTitles[location] || 'Dashboard';
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const pageTitle = getPageTitle(location);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!user,
  });

  const unreadCount = unreadData?.count || 0;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out'
      });
      setLocation('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to logout'
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
  };

  const sidebarStyle = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-primary" />
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-bold text-lg">LegalCRM Pro</p>
                <p className="text-xs text-muted-foreground">Hawaii Law Practice</p>
              </div>
            </div>
          </SidebarHeader>
          
          <Separator />
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link href={item.href} data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            {item.label === 'Messages' && unreadCount > 0 && (
                              <Badge variant="default" className="ml-auto" data-testid="unread-badge">
                                {unreadCount}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/settings" data-testid="nav-link-settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="bg-card border-b border-border px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-1 sm:gap-2 flex-shrink-0 overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
              <SidebarTrigger className="flex-shrink-0" data-testid="button-sidebar-toggle" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-2xl font-semibold text-foreground truncate" data-testid="page-title">
                  {pageTitle}
                </h2>
                <span className="text-xs text-muted-foreground hidden md:block" data-testid="welcome-message">
                  Welcome back, {user?.firstName || user?.username || 'User'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-notifications">
                    <Bell className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2" data-testid="button-user-menu">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground text-sm hidden lg:block" data-testid="text-user-name">
                      {getUserDisplayName()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-settings">
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

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
