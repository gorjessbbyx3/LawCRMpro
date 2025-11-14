import { createContext, useContext, useReducer, ReactNode } from 'react';

interface SelectionState {
  selectedIds: Set<string>;
}

type SelectionAction =
  | { type: 'TOGGLE'; id: string }
  | { type: 'SELECT_ALL'; ids: string[] }
  | { type: 'CLEAR_ALL' };

interface SelectionContextType {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'TOGGLE': {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(action.id)) {
        newSelected.delete(action.id);
      } else {
        newSelected.add(action.id);
      }
      return { selectedIds: newSelected };
    }
    case 'SELECT_ALL': {
      return { selectedIds: new Set(action.ids) };
    }
    case 'CLEAR_ALL': {
      return { selectedIds: new Set() };
    }
    default:
      return state;
  }
}

export function TimeEntrySelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, { selectedIds: new Set<string>() });

  const toggleSelection = (id: string) => {
    dispatch({ type: 'TOGGLE', id });
  };

  const selectAll = (ids: string[]) => {
    dispatch({ type: 'SELECT_ALL', ids });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const isSelected = (id: string) => {
    return state.selectedIds.has(id);
  };

  return (
    <SelectionContext.Provider value={{ selectedIds: state.selectedIds, toggleSelection, selectAll, clearAll, isSelected }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useTimeEntrySelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useTimeEntrySelection must be used within TimeEntrySelectionProvider');
  }
  return context;
}
