import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type TimeEntryStatus = 'draft' | 'ready_to_bill' | 'invoiced' | 'paid';

const ALLOWED_TRANSITIONS: Record<TimeEntryStatus, TimeEntryStatus[]> = {
  draft: ['ready_to_bill'],
  ready_to_bill: ['invoiced', 'draft'],
  invoiced: ['paid', 'ready_to_bill'],
  paid: ['invoiced'],
};

const STATUS_LABELS: Record<TimeEntryStatus, string> = {
  draft: 'Draft',
  ready_to_bill: 'Ready to Bill',
  invoiced: 'Invoiced',
  paid: 'Paid',
};

interface StatusControlsProps {
  currentStatus: TimeEntryStatus | null;
  onStatusChange: (newStatus: TimeEntryStatus) => void;
  disabled?: boolean;
  entryId: string;
}

export function StatusControls({ currentStatus, onStatusChange, disabled, entryId }: StatusControlsProps) {
  if (!currentStatus) {
    return null;
  }

  const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (allowedTransitions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          data-testid={`button-status-${entryId}`}
        >
          Change Status
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allowedTransitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onStatusChange(status)}
            data-testid={`menu-status-${status}-${entryId}`}
          >
            {STATUS_LABELS[status]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
