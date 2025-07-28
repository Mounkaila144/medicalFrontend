"use client";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Calendar, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Availability, AvailabilitySlot } from "@/types/schedule";

interface WeeklyScheduleViewProps {
  availabilities: Availability[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  timeSlots?: AvailabilitySlot[];
  practitionerName?: string;
}

export function WeeklyScheduleView({
  availabilities,
  selectedDate,
  onDateSelect,
  timeSlots = [],
  practitionerName,
}: WeeklyScheduleViewProps) {
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getAvailabilityForDay = (date: Date): Availability[] => {
    const weekday = date.getDay();
    return availabilities.filter(avail => avail.weekday === weekday);
  };

  const getTimeSlotsForDay = (date: Date): AvailabilitySlot[] => {
    if (!isSameDay(date, selectedDate)) return [];
    return timeSlots;
  };

  const getUtilizationRate = (daySlots: AvailabilitySlot[]) => {
    if (daySlots.length === 0) return 0;
    const bookedSlots = daySlots.filter(slot => !slot.available).length;
    return (bookedSlots / daySlots.length) * 100;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Semaine du {format(weekDays[0], "dd MMM yyyy", { locale: fr })}
          </h3>
          {practitionerName && (
            <p className="text-sm text-muted-foreground flex items-center">
              <User className="mr-1 h-4 w-4" />
              {practitionerName}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            Vue Hebdomadaire
          </Badge>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayAvailabilities = getAvailabilityForDay(day);
          const dayTimeSlots = getTimeSlotsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isSelectedDay = isSameDay(day, selectedDate);
          const utilizationRate = getUtilizationRate(dayTimeSlots);

          return (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelectedDay && "ring-2 ring-primary border-primary",
                isToday && "bg-blue-50 border-blue-200",
                dayAvailabilities.length === 0 && "opacity-60"
              )}
              onClick={() => onDateSelect(day)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{format(day, "EEEE", { locale: fr })}</span>
                  {isToday && (
                    <Badge variant="default" className="text-xs">
                      Aujourd'hui
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(day, "dd MMM", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Availabilities */}
                <div className="space-y-1">
                  {dayAvailabilities.length > 0 ? (
                    <>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Disponibilités:
                      </div>
                      {dayAvailabilities.map((avail) => (
                        <div 
                          key={avail.id} 
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {avail.start} - {avail.end}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Pas de disponibilité
                    </div>
                  )}
                </div>

                {/* Time Slots Summary (for selected day) */}
                {isSelectedDay && dayTimeSlots.length > 0 && (
                  <div className="border-t pt-2 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Créneaux du jour:
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">
                        {dayTimeSlots.filter(slot => slot.available).length} libres
                      </span>
                      <span className="text-red-600">
                        {dayTimeSlots.filter(slot => !slot.available).length} occupés
                      </span>
                    </div>
                    {utilizationRate > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${utilizationRate}%` }}
                        ></div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Utilisation: {Math.round(utilizationRate)}%
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {dayAvailabilities.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateSelect(day);
                      }}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Voir détails
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {availabilities.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Disponibilités totales
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {weekDays.filter(day => getAvailabilityForDay(day).length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Jours avec disponibilités
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {timeSlots.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Créneaux aujourd'hui
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {timeSlots.filter(slot => slot.available).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Créneaux libres
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}