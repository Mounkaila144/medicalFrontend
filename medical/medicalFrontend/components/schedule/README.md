# Schedule Components

This directory contains components for managing practitioner schedules and availability.

## Components

### TimeSlotManager
- Manages practitioner availability schedules
- Allows adding, editing, and deleting time slots
- Supports different repeat patterns (weekly, bi-weekly, monthly)
- Organizes availability by day of the week

### WeeklyScheduleView  
- Displays a weekly overview of practitioner availability
- Shows time slots and utilization rates
- Interactive day selection
- Statistics summary

## Usage

```tsx
import { TimeSlotManager, WeeklyScheduleView } from '@/components/schedule';

// In your availability page
<TimeSlotManager
  practitionerId={practitionerId}
  availabilities={availabilities}
  onAdd={handleAdd}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
/>

<WeeklyScheduleView
  availabilities={availabilities}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  timeSlots={timeSlots}
  practitionerName={practitionerName}
/>
```

## Features

- **Multi-day scheduling**: Configure availability for different days of the week
- **Time slot management**: 30-minute intervals with customizable start/end times
- **Repeat patterns**: Weekly, bi-weekly, monthly, or one-time availability
- **Visual feedback**: Color-coded availability status and utilization rates
- **Responsive design**: Works on desktop and mobile devices
- **Mock data**: Includes sample data for development and testing

## Data Structure

The components work with the following data structures defined in `/types/schedule.ts`:

- `Availability`: Basic availability record with day, time, and repeat pattern
- `AvailabilitySlot`: Individual time slots with availability status
- `PractitionerSchedule`: Complete schedule data for a practitioner
- `ScheduleStats`: Statistics about schedule utilization