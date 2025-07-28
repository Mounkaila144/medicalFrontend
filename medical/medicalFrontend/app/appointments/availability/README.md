# Appointments Availability Page

This page provides comprehensive practitioner schedule management functionality for the medical management system.

## Features

### 📅 Multi-View Schedule Management
- **Calendar View**: Interactive calendar for date selection
- **Weekly View**: Comprehensive weekly schedule overview with utilization statistics
- **Daily Slots**: Detailed view of time slots for selected date
- **Schedule Management**: Complete availability configuration interface

### 👨‍⚕️ Practitioner Management
- Select from available practitioners
- View practitioner-specific schedules and availability
- Manage individual practitioner time slots

### ⏰ Time Slot Management
- Create, edit, and delete availability slots
- Support for different repeat patterns:
  - Weekly recurring
  - Bi-weekly
  - Monthly
  - One-time availability
- 30-minute time slot intervals
- Customizable start and end times

### 📊 Statistics & Analytics
- Real-time availability statistics
- Utilization rates and booking metrics
- Visual progress indicators
- Day-by-day availability breakdown

## Usage

### Navigation
Access via: **Planification > Disponibilités** in the main navigation sidebar.

### Basic Workflow
1. **Select Practitioner**: Choose from the dropdown list of available practitioners
2. **Choose Date**: Use the calendar picker to select the target date
3. **View Schedule**: Switch between different views (Calendar, Weekly, Daily Slots)
4. **Manage Availability**: Use the "Gestion Horaires" tab to configure schedule

### Managing Availability
1. Go to the "Gestion Horaires" tab
2. Click "Ajouter un Créneau" to create new availability
3. Configure:
   - Day of the week
   - Start and end times
   - Repeat pattern
4. Save changes

### Understanding the Views

#### Calendar View
- Standard calendar interface
- Click any date to see availability for that day
- Visual indicators show days with scheduled availability

#### Weekly View
- Shows entire week at a glance
- Each day card displays:
  - Available time slots
  - Booking statistics (for selected day)
  - Utilization rate
- Click any day to focus on it

#### Daily Slots View
- Detailed time slot breakdown for selected date
- Color-coded availability status:
  - Green: Available slots
  - Gray: Booked/Unavailable slots
- 30-minute interval display

## Technical Implementation

### Components Used
- `/components/schedule/TimeSlotManager`: Schedule configuration interface
- `/components/schedule/WeeklyScheduleView`: Weekly overview component
- Standard UI components (Card, Button, Calendar, etc.)

### Data Sources
- **Development**: Mock data with realistic practitioner schedules
- **Production**: API integration with backend availability endpoints

### API Integration Points
- `GET /availabilities` - Fetch practitioner availability
- `GET /practitioner/schedule/availability` - Get time slots
- `POST /availabilities` - Create new availability
- `PUT /availabilities/:id` - Update availability
- `DELETE /availabilities/:id` - Remove availability

## Mock Data Structure

The page includes comprehensive mock data for development:

### Sample Practitioners
- Dr. Sarah Johnson (Cardiology)
- Dr. James Williams (Pediatrics)  
- Dr. Emily Brown (Dermatology)

### Sample Availability
- Weekday schedules (Monday-Friday)
- Various time patterns (full day, half day, afternoon only)
- Realistic medical practice hours (8 AM - 6 PM)

### Time Slot Simulation
- 30-minute intervals
- Realistic booking patterns
- Mixed availability status for demonstration

## Error Handling

The page includes comprehensive error handling for:
- Missing practitioner selection
- Failed API calls
- Invalid time slot configurations
- Network connectivity issues

## Responsive Design

Fully responsive design supporting:
- Desktop: Full feature set with side-by-side views
- Tablet: Adapted layout with collapsed navigation
- Mobile: Stack-based layout with touch-friendly controls

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast color schemes
- Focus indicators for interactive elements

## Development Notes

### File Structure
```
app/appointments/availability/
├── page.tsx              # Main availability page component
└── README.md             # This documentation

components/schedule/
├── time-slot-manager.tsx # Schedule management interface
├── weekly-schedule-view.tsx # Weekly overview component
├── index.ts              # Component exports
└── README.md             # Component documentation

services/
└── availability-service.ts # API service layer

types/
└── schedule.ts           # Type definitions
```

### Key Dependencies
- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icon components
- `@radix-ui`: UI component primitives
- Next.js App Router for routing

### Integration Points
- Backend scheduling module (`/src/scheduling/`)
- Authentication system for practitioner access
- Tenant isolation for multi-clinic support