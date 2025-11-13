import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTimeEntrySchema, type TimeEntry, type Case } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Clock, Play, Square, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import TimeModal from "@/components/time-tracking/time-modal";
import { DEMO_ATTORNEY_ID } from "@/lib/constants";

// Mock attorney ID - in real app this would come from auth context
const ATTORNEY_ID = DEMO_ATTORNEY_ID;

const activityTypes = [
  { value: "all", label: "All Activities" },
  { value: "legal_research", label: "Legal Research" },
  { value: "client_meeting", label: "Client Meeting" },
  { value: "court_appearance", label: "Court Appearance" },
  { value: "document_review", label: "Document Review" },
  { value: "phone_call", label: "Phone Call" },
  { value: "administrative", label: "Administrative" },
];

export default function TimeTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActivity, setFilterActivity] = useState("all");
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-entries"],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: activeEntry } = useQuery({
    queryKey: ["/api/time-entries/active", ATTORNEY_ID],
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/time-entries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setIsEditModalOpen(false);
      setEditingEntry(null);
      form.reset();
      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertTimeEntrySchema.partial()),
    defaultValues: {
      activity: "",
      description: "",
      duration: 0,
      hourlyRate: "",
      isBillable: true,
    },
  });

  const filteredEntries = timeEntries.filter((entry: TimeEntry) => {
    const matchesSearch = entry.activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = filterActivity === "all" || entry.activity === filterActivity;
    return matchesSearch && matchesActivity;
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "0:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    form.setValue("activity", entry.activity || "");
    form.setValue("description", entry.description || "");
    form.setValue("duration", entry.duration || 0);
    form.setValue("hourlyRate", entry.hourlyRate?.toString() || "");
    form.setValue("isBillable", entry.isBillable ?? true);
    setIsEditModalOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingEntry) {
      updateTimeEntryMutation.mutate({
        id: editingEntry.id,
        data: {
          ...data,
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        },
      });
    }
  };

  const totalBillableHours = filteredEntries
    .filter((entry: TimeEntry) => entry.isBillable && entry.duration)
    .reduce((total: number, entry: TimeEntry) => total + (entry.duration || 0), 0);

  const totalRevenue = filteredEntries
    .filter((entry: TimeEntry) => entry.isBillable && entry.duration && entry.hourlyRate)
    .reduce((total: number, entry: TimeEntry) => {
      const hours = (entry.duration || 0) / 60;
      const rate = parseFloat(entry.hourlyRate?.toString() || "0");
      return total + (hours * rate);
    }, 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Time Tracking</h1>
        <Button onClick={() => setIsTimeModalOpen(true)} data-testid="button-start-timer">
          <Plus className="w-4 h-4 mr-2" />
          Start Timer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours (Billable)</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-billable-hours">
                  {formatDuration(totalBillableHours)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-entries">
                  {filteredEntries.length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <span className="text-green-600 font-bold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Timer Alert */}
      {activeEntry && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Timer is running</p>
                  <p className="text-xs text-muted-foreground">
                    {activeEntry.activity?.replace('_', ' ')} - Started at {format(new Date(activeEntry.startTime), "h:mm a")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-700">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search time entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-entries"
          />
        </div>
        <Select value={filterActivity} onValueChange={setFilterActivity}>
          <SelectTrigger className="w-48" data-testid="select-activity-filter">
            <SelectValue placeholder="Filter by activity" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((activity) => (
              <SelectItem key={activity.value} value={activity.value}>
                {activity.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-entries">
                {searchTerm || filterActivity !== "all"
                  ? "No time entries found matching your criteria."
                  : "No time entries yet. Start your first timer to begin tracking time."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry: TimeEntry) => {
            const caseInfo = cases.find((c: Case) => c.id === entry.caseId);
            return (
              <Card key={entry.id} data-testid={`time-entry-${entry.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground" data-testid={`entry-activity-${entry.id}`}>
                          {entry.activity?.replace('_', ' ')}
                        </h3>
                        {entry.isBillable ? (
                          <Badge variant="default" className="text-xs">Billable</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Non-billable</Badge>
                        )}
                        {!entry.endTime && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                            Running
                          </Badge>
                        )}
                      </div>

                      {caseInfo && (
                        <p className="text-sm text-muted-foreground mb-1" data-testid={`entry-case-${entry.id}`}>
                          {caseInfo.title} (#{caseInfo.caseNumber})
                        </p>
                      )}

                      {entry.description && (
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`entry-description-${entry.id}`}>
                          {entry.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span data-testid={`entry-date-${entry.id}`}>
                          {format(new Date(entry.startTime), "MMM d, yyyy")}
                        </span>
                        <span data-testid={`entry-time-${entry.id}`}>
                          {format(new Date(entry.startTime), "h:mm a")}
                          {entry.endTime && ` - ${format(new Date(entry.endTime), "h:mm a")}`}
                        </span>
                        <span data-testid={`entry-duration-${entry.id}`}>
                          {formatDuration(entry.duration)}
                        </span>
                        {entry.hourlyRate && (
                          <span data-testid={`entry-rate-${entry.id}`}>
                            ${entry.hourlyRate}/hr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                        data-testid={`button-edit-${entry.id}`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteTimeEntryMutation.mutate(entry.id)}
                        disabled={deleteTimeEntryMutation.isPending}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modals */}
      <TimeModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        attorneyId={ATTORNEY_ID}
      />

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent data-testid="edit-time-modal">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.slice(1).map((activity) => (
                          <SelectItem key={activity.value} value={activity.value}>
                            {activity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTimeEntryMutation.isPending}>
                  {updateTimeEntryMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
