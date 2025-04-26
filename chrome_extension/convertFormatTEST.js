import { convertICSToGoogleEvent } from './utils.js';

// Mock ICS Content
const icsTestContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-event-123
SUMMARY:Team Sync Meeting
DESCRIPTION:Weekly team meeting to sync on project updates.
LOCATION:Conference Room 1A
DTSTART:20250427T150000Z
DTEND:20250427T160000Z
END:VEVENT
END:VCALENDAR
`;

// Call your function
const googleEvent = convertICSToGoogleEvent(icsTestContent);

// Output result
console.log("Converted Google Calendar Event:");
console.log(JSON.stringify(googleEvent, null, 2));
