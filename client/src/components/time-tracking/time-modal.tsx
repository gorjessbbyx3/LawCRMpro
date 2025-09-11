import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTimeEntrySchema, type Case } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play } from "lucide-react";

interface TimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attorneyId: string;
}

const activityTypes = [
  { value: "legal_research", label: "Legal Research" },
  { value: "client_meeting", label: "Client Meeting" },
  { value: "court_appearance", label: "Court Appearance" },
  { value: "document_review", label: "Document Review" },
  { value: "phone_call", label: "Phone Call" },
  { value: "administrative", label: "Administrative" },
  { value: "case_preparation", label: "Case Preparation" },
  { value: "correspondence", label: "Correspondence" },
];

export default function TimeModal({ isOpen, onClose, attorneyId }: TimeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const startTimerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/time-entries", {
        ...data,
        startTime: new Date().toISOString(),
        attorneyId,
        isBillable: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active", attorneyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      form.reset();
      onClose();
      toast({
        title: "Timer Started",
        description: "Time tracking has begun for this activity",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertTimeEntrySchema.pick({
      caseId: true,
      activity: true,
      description: true,
    })),
    defaultValues: {
      caseId: "",
      activity: "",
      description: "",
    },
  });

  const onSubmit = (data: any) => {
    startTimerMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="time-modal">
        <DialogHeader>
          <DialogTitle>Start Time Tracking</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-case">
                        <SelectValue placeholder="Select case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
            
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-activity">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((activity) => (
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Brief description of work..."
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={startTimerMutation.isPending}
                data-testid="button-start-timer"
              >
                <Play className="w-4 h-4 mr-2" />
                {startTimerMutation.isPending ? "Starting..." : "Start Timer"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
