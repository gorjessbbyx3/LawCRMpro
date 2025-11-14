-- Migration: Add indexes for calendar event source tracking
-- Purpose: Support efficient queries and prevent duplicate time-entry events
-- Date: 2025-11-14

-- Composite index for filtering events by source
CREATE INDEX IF NOT EXISTS idx_calendar_events_source 
ON calendar_events(source_type, source_id) 
WHERE source_type IS NOT NULL;

-- Partial unique index to prevent duplicate events from same time entry
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_time_entry_unique 
ON calendar_events(source_type, source_id) 
WHERE source_type = 'time_entry';

-- Index for reverse lookup from time entries to calendar events
CREATE INDEX IF NOT EXISTS idx_time_entries_calendar_event 
ON time_entries(calendar_event_id) 
WHERE calendar_event_id IS NOT NULL;
