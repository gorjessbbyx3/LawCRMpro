import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  status: string;
}

export default function PortalEvents() {
  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/portal/events'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents = events?.filter(e => new Date(e.startTime) > now) || [];
  const pastEvents = events?.filter(e => new Date(e.startTime) <= now) || [];

  const getEventTypeVariant = (type: string) => {
    switch (type) {
      case 'court_date': return 'destructive';
      case 'meeting': return 'default';
      case 'deadline': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Calendar Events
        </h1>
        <p className="text-muted-foreground">Scheduled meetings, court dates, and deadlines</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events scheduled in the future</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} getEventTypeVariant={getEventTypeVariant} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Events</CardTitle>
            <CardDescription>Previously scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 opacity-75">
              {pastEvents.slice(0, 10).map((event) => (
                <EventCard key={event.id} event={event} getEventTypeVariant={getEventTypeVariant} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventCard({ 
  event, 
  getEventTypeVariant 
}: { 
  event: CalendarEvent; 
  getEventTypeVariant: (type: string) => "default" | "destructive" | "secondary" | "outline";
}) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  return (
    <div 
      className="p-4 rounded-md border bg-muted/50"
      data-testid={`card-event-${event.id}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <p className="font-medium">{event.title}</p>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {startDate.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <Badge variant={getEventTypeVariant(event.eventType)}>
          {event.eventType.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  );
}
