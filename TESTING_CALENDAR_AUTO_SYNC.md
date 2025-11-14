# Testing Calendar Auto-Sync Feature

## Overview
Time tracking entries now automatically create calendar events when timers are stopped.

## How to Test

### 1. Create and Stop a Time Entry
1. Log in to the application (username: `attorney`, password: `demo123`)
2. Navigate to Time Tracking page
3. Click "Start Timer" and select a case
4. Enter activity details (e.g., "Client Meeting")
5. Add a description
6. Click "Stop Timer"

### 2. Verify Calendar Event Creation
1. Navigate to Calendar page
2. Check if the time entry appears as a calendar event
3. Event should show:
   - Title: `${activity}: ${description}`
   - Start/End times matching the time entry
   - Event type mapped from activity (court→court_date, meeting→meeting)
   - Status: "completed"

### 3. Check Database Link
Look in the database to verify:
```sql
-- Find time entries with linked calendar events
SELECT te.id, te.activity, te.description, te.calendar_event_id, ce.title
FROM time_entries te
LEFT JOIN calendar_events ce ON te.calendar_event_id = ce.id
WHERE te.calendar_event_id IS NOT NULL
ORDER BY te.created_at DESC
LIMIT 10;

-- Verify sourceType and sourceId
SELECT id, title, event_type, source_type, source_id
FROM calendar_events
WHERE source_type = 'time_entry'
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Check Server Logs
After stopping a timer, check server logs for:
- `[AUTO-SYNC SUCCESS] Created calendar event {id} for time entry {id}`
- If there are errors: detailed validation or persistence error messages

## Expected Behavior

### Success Case
- Timer stops successfully
- Calendar event is created with sourceType='time_entry'
- Time entry is updated with calendarEventId
- Event appears in calendar views (day/week/month)
- Success log message appears in server console

### Edge Cases
- **No caseId:** Calendar event is NOT created (time entry must be linked to a case)
- **Timer not stopped:** Calendar event is NOT created (only created when timer stops)
- **Duplicate prevention:** Partial unique index prevents multiple calendar events for same time entry

## Activity to Event Type Mapping
- Court/Hearing activities → court_date
- Meeting/Conference activities → meeting  
- Deadline/Filing activities → deadline
- Consultation/Interview activities → consultation
- Other activities → meeting (default)

## Troubleshooting

### Calendar Event Not Created
1. Check server logs for errors
2. Verify time entry has:
   - startTime
   - endTime
   - caseId
3. Check if validation errors occurred
4. Verify database migration applied: `idx_calendar_events_time_entry_unique`

### Duplicate Events
The partial unique index should prevent duplicates:
```sql
-- This should show the unique index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'calendar_events' 
  AND indexname LIKE '%time_entry%';
```

## Implementation Notes
- Auto-sync happens server-side during PATCH /api/time-entries/:id/stop
- **Success (HTTP 200):** Timer stopped AND calendar event created successfully
- **Failure (HTTP 500):** Timer stopped but calendar event creation failed
  - Response includes error details: `{ message, timeEntry, syncError }`
  - Client should display error alert to user
  - Time entry is still saved, but calendar event is not created
- All errors are logged with full details for debugging
