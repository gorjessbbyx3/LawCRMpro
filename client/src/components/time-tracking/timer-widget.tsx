import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TimeModal from "./time-modal";
import type { TimeEntry } from "@shared/schema";
import { DEMO_ATTORNEY_ID } from "@/lib/constants";

// Mock attorney ID - in real app this would come from auth context
const ATTORNEY_ID = DEMO_ATTORNEY_ID;

export default function TimerWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeEntry } = useQuery({
    queryKey: ["/api/time-entries/active", ATTORNEY_ID],
    refetchInterval: 1000, // Refresh every second to update timer
  });

  const stopTimerMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const endTime = new Date();
      const entry = activeEntry as TimeEntry;
      const startTime = new Date(entry.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // in minutes
      
      const response = await apiRequest("PUT", `/api/time-entries/${entryId}`, {
        endTime: endTime.toISOString(),
        duration,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries/active", ATTORNEY_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Timer Stopped",
        description: "Time entry has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    },
  });

  // Update elapsed time for active timer
  useEffect(() => {
    if (!activeEntry) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeEntry.startTime).getTime();
    const updateElapsed = () => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [activeEntry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = () => {
    if (activeEntry) {
      stopTimerMutation.mutate(activeEntry.id);
    }
  };

  if (activeEntry) {
    return (
      <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg timer-running" data-testid="active-timer">
        <Clock className="text-primary w-4 h-4" />
        <span className="text-sm font-medium" data-testid="timer-display">
          {formatTime(elapsedTime)}
        </span>
        <Badge variant="secondary" className="text-xs" data-testid="timer-activity">
          {activeEntry.activity?.replace('_', ' ')}
        </Badge>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleStopTimer}
          disabled={stopTimerMutation.isPending}
          data-testid="button-stop-timer"
          className="text-destructive hover:text-destructive/80 border-destructive"
        >
          <Square className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        size="sm"
        onClick={() => setIsModalOpen(true)}
        data-testid="button-start-timer"
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Timer
      </Button>
      
      <TimeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        attorneyId={ATTORNEY_ID}
      />
    </>
  );
}
