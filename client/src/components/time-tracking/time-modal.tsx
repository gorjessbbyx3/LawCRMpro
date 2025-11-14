import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTimeEntrySchema, type Case, type ActivityTemplate } from "@shared/schema";
import { UTBMS_CODES } from "@shared/utbmsCodes";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Mic } from "lucide-react";

interface TimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attorneyId: string;
}


export default function TimeModal({ isOpen, onClose, attorneyId }: TimeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: templates = [] } = useQuery<ActivityTemplate[]>({
    queryKey: ["/api/activity-templates"],
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
      utbmsCode: true,
    })),
    defaultValues: {
      caseId: "",
      activity: "",
      description: "",
      utbmsCode: "",
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue("activity", template.activity);
      if (template.utbmsCode) {
        form.setValue("utbmsCode", template.utbmsCode);
      }
      if (template.defaultDescription) {
        form.setValue("description", template.defaultDescription);
      }
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue("description", transcript);
    };

    recognition.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to capture voice input",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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
            <FormItem>
              <FormLabel>Activity Template (Optional)</FormLabel>
              <Select onValueChange={handleTemplateSelect}>
                <FormControl>
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Select template to auto-fill" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.utbmsCode && `(${template.utbmsCode})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          
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
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Legal Research"
                      data-testid="input-activity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="utbmsCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UTBMS Code (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-utbms">
                        <SelectValue placeholder="Select UTBMS code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {UTBMS_CODES.map((code) => (
                        <SelectItem key={code.code} value={code.code}>
                          {code.code} - {code.description}
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
                  <FormLabel className="flex items-center justify-between">
                    <span>Description (Optional)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={startVoiceInput}
                      disabled={isListening}
                      data-testid="button-voice-input"
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
                    </Button>
                  </FormLabel>
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
