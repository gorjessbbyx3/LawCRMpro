import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarEventSchema, type CalendarEvent, type Case, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, MapPin, CalendarDays, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, startOfMonth, endOfMonth, isSameDay } from "date-fns";

type CalendarView = "day" | "week" | "month";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/calendar/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCalendarEventSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(),
      eventType: "meeting",
      location: "",
      reminderMinutes: 15,
      status: "scheduled",
    },
  });

  const onSubmit = (data: any) => {
    createEventMutation.mutate(data);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "court_date":
        return "destructive";
      case "meeting":
        return "default";
      case "deadline":
        return "secondary";
      case "consultation":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getViewDates = () => {
    if (view === "day") {
      return [selectedDate];
    } else if (view === "week") {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return eachDayOfInterval({ start, end });
    } else {
      // Month view: include padding days to create complete weeks
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const start = startOfWeek(monthStart);
      const end = endOfWeek(monthEnd);
      return eachDayOfInterval({ start, end });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  const viewDates = getViewDates();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              size="sm"
              variant={view === "day" ? "default" : "ghost"}
              onClick={() => setView("day")}
              data-testid="button-view-day"
              className="px-3"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Day
            </Button>
            <Button
              size="sm"
              variant={view === "week" ? "default" : "ghost"}
              onClick={() => setView("week")}
              data-testid="button-view-week"
              className="px-3"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Week
            </Button>
            <Button
              size="sm"
              variant={view === "month" ? "default" : "ghost"}
              onClick={() => setView("month")}
              data-testid="button-view-month"
              className="px-3"
            >
              <LayoutList className="w-4 h-4 mr-1" />
              Month
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-event">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Client Meeting" data-testid="input-event-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="court_date">Court Date</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="deadline">Deadline</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="caseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Case (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-case">
                                <SelectValue placeholder="Select case" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No case</SelectItem>
                              {cases.map((caseItem: Case) => (
                                <SelectItem key={caseItem.id} value={caseItem.id}>
                                  {caseItem.title} (#{caseItem.caseNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              data-testid="input-start-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              data-testid="input-end-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Office, Court Room 3" data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Event details..." data-testid="textarea-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reminderMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder (minutes before)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-reminder">
                              <SelectValue placeholder="Select reminder time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">No reminder</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="1440">1 day</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEventMutation.isPending} data-testid="button-save-event">
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              data-testid="calendar-widget"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Viewing: <span className="font-medium text-foreground">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Date: <span className="font-medium text-foreground">{format(selectedDate, "MMM d, yyyy")}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid/List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {view === "day" && `Events for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
              {view === "week" && `Week of ${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d, yyyy")}`}
              {view === "month" && format(selectedDate, "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {view === "day" && (
              <DayView date={selectedDate} events={getEventsForDate(selectedDate)} getEventTypeColor={getEventTypeColor} />
            )}
            {view === "week" && (
              <WeekView dates={viewDates} events={events} getEventsForDate={getEventsForDate} getEventTypeColor={getEventTypeColor} />
            )}
            {view === "month" && (
              <MonthView dates={viewDates} events={events} getEventsForDate={getEventsForDate} getEventTypeColor={getEventTypeColor} selectedDate={selectedDate} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Events (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events
              .filter((event: CalendarEvent) => {
                const eventDate = new Date(event.startTime);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return eventDate <= nextWeek && eventDate >= new Date();
              })
              .slice(0, 4)
              .map((event: CalendarEvent) => (
                <Card key={event.id} className="p-4" data-testid={`upcoming-event-${event.id}`}>
                  <div className="space-y-2">
                    <Badge variant={getEventTypeColor(event.eventType)} className="text-xs">
                      {event.eventType.replace("_", " ")}
                    </Badge>
                    <h4 className="font-medium text-sm" data-testid={`upcoming-title-${event.id}`}>
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground" data-testid={`upcoming-date-${event.id}`}>
                      {format(new Date(event.startTime), "MMM d, h:mm a")}
                    </p>
                  </div>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DayView({ date, events, getEventTypeColor }: { date: Date; events: CalendarEvent[]; getEventTypeColor: (type: string) => any }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8" data-testid="text-no-events">
        No events scheduled for this date.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: CalendarEvent) => (
        <Card key={event.id} className="p-4" data-testid={`event-${event.id}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-medium" data-testid={`event-title-${event.id}`}>
                  {event.title}
                </h3>
                <Badge variant={getEventTypeColor(event.eventType)} data-testid={`event-type-${event.id}`}>
                  {event.eventType.replace("_", " ")}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span data-testid={`event-time-${event.id}`}>
                    {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span data-testid={`event-location-${event.id}`}>{event.location}</span>
                  </div>
                )}
                
                {event.description && (
                  <p className="mt-2" data-testid={`event-description-${event.id}`}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
            
            <Badge variant="outline" data-testid={`event-status-${event.id}`}>
              {event.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

function WeekView({ dates, events, getEventsForDate, getEventTypeColor }: { 
  dates: Date[]; 
  events: CalendarEvent[]; 
  getEventsForDate: (date: Date) => CalendarEvent[]; 
  getEventTypeColor: (type: string) => any;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {dates.map((date) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, new Date());
        
        return (
          <div key={date.toISOString()} className={`space-y-2 ${isToday ? 'ring-2 ring-primary rounded-md p-2' : 'p-2'}`} data-testid={`day-${format(date, "yyyy-MM-dd")}`}>
            <div className="font-medium text-sm">
              <div className={isToday ? "text-primary" : ""}>{format(date, "EEE")}</div>
              <div className={`text-2xl ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>{format(date, "d")}</div>
            </div>
            <div className="space-y-1">
              {dayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events</p>
              ) : (
                dayEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="text-xs rounded-md p-1 bg-muted" data-testid={`week-event-${event.id}`}>
                    <Badge variant={getEventTypeColor(event.eventType)} className="text-xs mb-1">
                      {event.eventType.replace("_", " ")}
                    </Badge>
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-muted-foreground">{format(new Date(event.startTime), "h:mm a")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ dates, events, getEventsForDate, getEventTypeColor, selectedDate }: { 
  dates: Date[]; 
  events: CalendarEvent[]; 
  getEventsForDate: (date: Date) => CalendarEvent[]; 
  getEventTypeColor: (type: string) => any;
  selectedDate: Date;
}) {
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-2">
          {week.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
            
            return (
              <div 
                key={date.toISOString()} 
                className={`border rounded-md p-2 min-h-24 ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'bg-muted/30' : ''}`}
                data-testid={`month-day-${format(date, "yyyy-MM-dd")}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : isCurrentMonth ? '' : 'text-muted-foreground'}`}>
                  {format(date, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event: CalendarEvent) => (
                    <div key={event.id} className="text-xs rounded-sm p-1 bg-muted" data-testid={`month-event-${event.id}`}>
                      <Badge variant={getEventTypeColor(event.eventType)} className="text-xs">
                        {event.eventType.replace("_", " ")}
                      </Badge>
                      <p className="font-medium truncate">{event.title}</p>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
