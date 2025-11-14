import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTimeEntrySelection } from "./time-entry-selection-context";
import { CheckCircle2, Trash2 } from "lucide-react";

interface BatchActionsBarProps {
  onApprove: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  isApproving: boolean;
  isDeleting: boolean;
}

export function BatchActionsBar({ onApprove, onDelete, isApproving, isDeleting }: BatchActionsBarProps) {
  const { selectedIds, clearAll } = useTimeEntrySelection();

  if (selectedIds.size === 0) return null;

  const selectedArray = Array.from(selectedIds);

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {selectedIds.size} {selectedIds.size === 1 ? 'entry' : 'entries'} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onApprove(selectedArray);
                clearAll();
              }}
              disabled={isApproving || isDeleting}
              data-testid="button-approve-selected"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {isApproving ? 'Approving...' : 'Approve Selected'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? 'entry' : 'entries'}?`)) {
                  onDelete(selectedArray);
                  clearAll();
                }
              }}
              disabled={isApproving || isDeleting}
              data-testid="button-delete-selected"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearAll}
              disabled={isApproving || isDeleting}
              data-testid="button-clear-selection"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
