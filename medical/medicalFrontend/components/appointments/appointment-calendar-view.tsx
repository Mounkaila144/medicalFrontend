"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  date: Date;
  setDate: (date: Date) => void;
  isLoading: boolean;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export function AppointmentCalendarView({ 
  appointments, 
  date, 
  setDate, 
  isLoading,
  onAppointmentEdit
}: AppointmentCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(date);

  useEffect(() => {
    setCurrentMonth(date);
  }, [date]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.startAt || appointment.startTime || ''), day)
    );
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
      case "no_show":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-progress":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prevMonth);
    setDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(nextMonth);
    setDate(nextMonth);
  };

  const handleDayClick = (day: Date) => {
    setDate(day);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(42).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium border-b border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, date);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r last:border-r-0 cursor-pointer hover:bg-muted/30 transition-colors",
                  !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  isSelected && "bg-primary/10 ring-2 ring-primary/20",
                  isToday && "bg-accent/50"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday && "text-primary font-bold"
                  )}>
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <Card
                      key={appointment.id}
                      className={cn(
                        "text-xs p-1 cursor-pointer hover:shadow-sm transition-shadow",
                        getStatusColor(appointment.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAppointmentEdit) {
                          onAppointmentEdit(appointment);
                        }
                      }}
                    >
                      <CardContent className="p-1">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">
                            {format(new Date(appointment.startAt || appointment.startTime || ''), "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            {appointment.patientName || (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">
                            {appointment.purpose || appointment.reason || 'No reason specified'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {getAppointmentsForDay(date).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">
              Appointments for {format(date, "EEEE, MMMM d, yyyy")}
            </h4>
            <div className="space-y-2">
              {getAppointmentsForDay(date).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    if (onAppointmentEdit) {
                      onAppointmentEdit(appointment);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {format(new Date(appointment.startAt || appointment.startTime || ''), "HH:mm")}
                    </div>
                    <div>
                      <div className="font-medium">
                        {appointment.patientName || (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.purpose || appointment.reason || 'No reason specified'}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}