# Appointments Queue Management

## Overview
The appointments queue page allows clinic staff to manage patients waiting for consultations. This is a real-time queue management system that helps organize patient flow and prioritize urgent cases.

## Features

### Queue Management
- **View Active Queue**: Display all patients currently waiting
- **Priority Management**: Set and update patient priorities (Low, Normal, High, Urgent)
- **Real-time Updates**: Automatic refresh to show current queue status
- **Wait Time Tracking**: Shows how long each patient has been waiting

### Patient Status Management
- **Add to Queue**: Add new patients to the waiting queue
- **Update Priority**: Change patient priority level in real-time
- **Remove from Queue**: Mark patients as seen or remove them
- **Edit Details**: Update reason for visit and other details

### Queue Statistics
- **Total Waiting**: Number of patients currently in queue
- **Priority Breakdown**: Count of urgent and high-priority patients
- **Average Wait Time**: Real-time calculation of average waiting time

## API Integration

The page integrates with the backend wait queue API endpoints:
- `GET /wait-queue` - Fetch current queue
- `POST /wait-queue` - Add patient to queue
- `PATCH /wait-queue/{id}` - Update queue entry
- `DELETE /wait-queue/{id}` - Remove from queue

## Usage

### Adding a Patient to Queue
1. Click "Ajouter à la file" button
2. Enter patient ID and practitioner ID
3. Select priority level
4. Provide reason for visit
5. Click "Ajouter" to add to queue

### Managing Queue Entries
- **Change Priority**: Use the dropdown to quickly change priority
- **Edit Details**: Click edit button to modify reason or other details
- **Mark as Seen**: Click the user check button to mark patient as seen
- **Remove**: Click trash button to remove from queue

### Queue Organization
- Patients are automatically sorted by priority (Urgent → High → Normal → Low)
- Within same priority, sorted by arrival time (first-come, first-served)
- Color-coded priority badges for quick visual identification

## Components Used
- Shadcn/ui components for consistent UI
- Date-fns for time formatting
- Lucide React icons
- React hooks for state management

## File Structure
```
app/appointments/queue/
├── page.tsx           # Main queue management page
└── README.md          # This documentation
```

## Notes
- The page uses the real appointment service API (not mock data)
- All queue operations are reflected in the backend database
- Real-time updates help coordinate between multiple staff members
- French language interface for Quebec medical clinic context