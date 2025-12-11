import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Briefcase, FileText, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalAuth } from '@/lib/portal-auth';

interface DashboardData {
  activeCasesCount: number;
  pendingInvoicesCount: number;
  upcomingEventsCount: number;
  recentCases: any[];
  upcomingEvents: any[];
  pendingInvoices: any[];
}

export default function PortalDashboard() {
  const [, setLocation] = useLocation();
  const { user } = usePortalAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/portal/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-portal-welcome">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your legal matters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="hover-elevate cursor-pointer" 
          onClick={() => setLocation('/portal/cases')}
          data-testid="card-active-cases"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeCasesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Click to view all cases</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-elevate cursor-pointer" 
          onClick={() => setLocation('/portal/invoices')}
          data-testid="card-pending-invoices"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingInvoicesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Click to view invoices</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-elevate cursor-pointer" 
          onClick={() => setLocation('/portal/events')}
          data-testid="card-upcoming-events"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.upcomingEventsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Click to view calendar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recent Cases
            </CardTitle>
            <CardDescription>Your active legal matters</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentCases && data.recentCases.length > 0 ? (
              <div className="space-y-3">
                {data.recentCases.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/portal/cases/${c.id}`)}
                    data-testid={`card-case-${c.id}`}
                  >
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{c.caseNumber}</p>
                    </div>
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                      {c.status}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => setLocation('/portal/cases')}
                  data-testid="button-view-all-cases"
                >
                  View All Cases <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No active cases</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Scheduled meetings and court dates</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingEvents.map((event: any) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`card-event-${event.id}`}
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startTime).toLocaleDateString()} at{' '}
                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="outline">{event.eventType.replace('_', ' ')}</Badge>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => setLocation('/portal/events')}
                  data-testid="button-view-all-events"
                >
                  View All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Need to Contact Your Attorney?
          </CardTitle>
          <CardDescription>Send a secure message through the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLocation('/portal/messages')} data-testid="button-send-message">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
