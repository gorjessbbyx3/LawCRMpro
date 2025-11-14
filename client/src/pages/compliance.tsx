import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ComplianceDeadline } from "@shared/schema";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Plus, 
  Clock,
  ExternalLink,
  BookOpen,
  Scale,
  Pencil,
  Trash2
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

const complianceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  deadlineType: z.enum(["bar_requirement", "court_filing", "ethics", "continuing_education"]),
  caseId: z.string().optional().nullable(),
});

const hawaiiResources = [
  {
    title: "Hawaii State Bar Association",
    description: "Official Hawaii State Bar resources and requirements",
    url: "https://hsba.org",
    category: "Bar Requirements",
  },
  {
    title: "Hawaii Courts System",
    description: "Court rules, forms, and filing requirements",
    url: "https://www.courts.state.hi.us",
    category: "Court Filing",
  },
  {
    title: "Hawaii Legal Ethics Rules",
    description: "Professional conduct rules and ethics guidelines",
    url: "https://hsba.org/Ethics",
    category: "Ethics",
  },
  {
    title: "CLE Requirements Hawaii",
    description: "Continuing legal education requirements and approved courses",
    url: "https://hsba.org/CLE",
    category: "Education",
  },
];

export default function Compliance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<ComplianceDeadline | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: deadlines = [], isLoading } = useQuery<ComplianceDeadline[]>({
    queryKey: ["/api/compliance/deadlines"],
  });

  const form = useForm({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      deadlineType: "bar_requirement" as const,
      caseId: "",
    },
  });

  const createDeadlineMutation = useMutation({
    mutationFn: async (data: z.infer<typeof complianceSchema>) => {
      if (editingDeadline) {
        return await apiRequest("PUT", `/api/compliance/deadlines/${editingDeadline.id}`, data);
      } else {
        return await apiRequest("POST", "/api/compliance/deadlines", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/deadlines"] });
      setIsDialogOpen(false);
      setEditingDeadline(null);
      form.reset();
      toast({
        title: "Success",
        description: editingDeadline ? "Compliance deadline updated successfully" : "Compliance deadline added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to save compliance deadline",
        variant: "destructive",
      });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async (deadlineId: string) => {
      return await apiRequest("PATCH", `/api/compliance/deadlines/${deadlineId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/deadlines"] });
      toast({
        title: "Success",
        description: "Compliance deadline updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update compliance deadline",
        variant: "destructive",
      });
    },
  });

  const deleteDeadlineMutation = useMutation({
    mutationFn: async (deadlineId: string) => {
      return await apiRequest("DELETE", `/api/compliance/deadlines/${deadlineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/deadlines"] });
      toast({
        title: "Success",
        description: "Compliance deadline deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete compliance deadline",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (deadline: ComplianceDeadline) => {
    setEditingDeadline(deadline);
    form.reset({
      title: deadline.title,
      description: deadline.description || "",
      dueDate: deadline.dueDate,
      deadlineType: deadline.deadlineType as any,
      caseId: deadline.caseId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingDeadline(null);
      form.reset();
    }
  };

  const onSubmit = (data: z.infer<typeof complianceSchema>) => {
    createDeadlineMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending": 
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredItems = deadlines.filter((item: ComplianceDeadline) => 
    filterStatus === "all" || item.status === filterStatus
  );

  const overdueCount = deadlines.filter((item: ComplianceDeadline) => item.status === "overdue").length;
  const pendingCount = deadlines.filter((item: ComplianceDeadline) => item.status === "pending").length;
  const completedCount = deadlines.filter((item: ComplianceDeadline) => item.status === "completed").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Hawaii Legal Compliance</h1>
            <p className="text-sm text-muted-foreground">Track legal requirements and deadlines</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-compliance">
              <Plus className="w-4 h-4 mr-2" />
              Add Deadline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDeadline ? "Edit" : "Add"} Compliance Deadline</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Bar license renewal" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadlineType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deadline-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bar_requirement">Bar Requirement</SelectItem>
                          <SelectItem value="court_filing">Court Filing</SelectItem>
                          <SelectItem value="ethics">Ethics Compliance</SelectItem>
                          <SelectItem value="continuing_education">Continuing Education</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-due-date" />
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
                        <Textarea {...field} placeholder="Additional details..." data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDeadlineMutation.isPending} data-testid="button-save-deadline">
                    {createDeadlineMutation.isPending ? "Saving..." : editingDeadline ? "Update" : "Save Deadline"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert for urgent items */}
      {overdueCount > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have <strong>{overdueCount}</strong> overdue compliance items that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Overdue Items</p>
                <p className="text-2xl font-bold text-red-800" data-testid="overdue-count">
                  {overdueCount}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Items</p>
                <p className="text-2xl font-bold text-orange-800" data-testid="pending-count">
                  {pendingCount}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-800" data-testid="completed-count">
                  {completedCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compliance Deadlines */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Compliance Deadlines</span>
                </CardTitle>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading deadlines...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No compliance deadlines found. Add one to get started.
                </div>
              ) : (
                filteredItems.map((item: ComplianceDeadline) => {
                  const dueDate = new Date(item.dueDate);
                  const isOverdue = isBefore(dueDate, new Date()) && item.status !== "completed";
                  const isDueSoon = isAfter(dueDate, new Date()) && isBefore(dueDate, addDays(new Date(), 30));

                  return (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg"
                      data-testid={`compliance-item-${item.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={item.status === "completed"}
                            onCheckedChange={() => toggleCompleteMutation.mutate(item.id)}
                            data-testid={`checkbox-complete-${item.id}`}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className={`font-medium ${item.status === "completed" ? "line-through text-muted-foreground" : ""}`} data-testid={`compliance-title-${item.id}`}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`compliance-description-${item.id}`}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(item.status || "pending")} data-testid={`compliance-status-${item.id}`}>
                            {item.status || "pending"}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this deadline?")) {
                                deleteDeadlineMutation.mutate(item.id);
                              }
                            }}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm ml-8">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`compliance-due-date-${item.id}`}>
                            Due: {format(dueDate, "MMM d, yyyy")}
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {isDueSoon && item.status !== "completed" && (
                            <Badge variant="secondary" className="text-xs">Due Soon</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.deadlineType.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Hawaii Legal Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hawaiiResources.map((resource, index) => (
              <div key={index} className="p-3 border rounded-lg" data-testid={`resource-${index}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm" data-testid={`resource-title-${index}`}>
                      {resource.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`resource-description-${index}`}>
                      {resource.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {resource.category}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`resource-link-${index}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scale className="w-5 h-5" />
            <span>Hawaii Attorney Compliance Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Annual Requirements</h4>
              <div className="space-y-3">
                {[
                  "Pay Hawaii State Bar annual dues",
                  "Complete CLE credit requirements (12 hours)",
                  "Submit license renewal application",
                  "Update contact information with Bar",
                  "Complete required ethics training"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span data-testid={`annual-req-${index}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Ongoing Compliance</h4>
              <div className="space-y-3">
                {[
                  "Maintain trust account reconciliation",
                  "File required court documents timely",
                  "Keep client confidentiality records",
                  "Monitor conflict of interest procedures",
                  "Update professional liability insurance"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span data-testid={`ongoing-req-${index}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
