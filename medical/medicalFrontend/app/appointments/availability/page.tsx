"use client";

import { useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  Settings,
  BarChart3,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { availabilityService } from "@/services/availability-service";
import { TimeSlotManager } from "@/components/schedule/time-slot-manager";
import { WeeklyScheduleView } from "@/components/schedule/weekly-schedule-view";
import { 
  PractitionerSchedule, 
  AvailabilitySlot, 
  Availability, 
  ScheduleStats,
  RepeatType,
  CreateAvailabilityDto
} from "@/types/schedule";

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("");
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<PractitionerSchedule | null>(null);
  const [timeSlots, setTimeSlots] = useState<AvailabilitySlot[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("calendar");

  // Load practitioners on component mount
  useEffect(() => {
    const loadPractitioners = async () => {
      try {
        const data = await availabilityService.getPractitioners();
        setPractitioners(data);
        if (data.length > 0) {
          setSelectedPractitioner(data[0].id);
        }
      } catch (error) {
        console.error("Error loading practitioners:", error);
      }
    };

    loadPractitioners();
  }, []);

  // Load schedule when practitioner or date changes
  useEffect(() => {
    if (selectedPractitioner) {
      loadScheduleData();
    }
  }, [selectedPractitioner, selectedDate]);

  const loadScheduleData = async () => {
    if (!selectedPractitioner) return;

    try {
      setIsLoading(true);
      
      // Load practitioner schedule and time slots
      const [scheduleData, timeSlotsData, statsData] = await Promise.all([
        availabilityService.getPractitionerSchedule(selectedPractitioner),
        availabilityService.getTimeSlots({
          practitionerId: selectedPractitioner,
          date: selectedDate
        }),
        availabilityService.getScheduleStats(selectedPractitioner, selectedDate)
      ]);

      setSchedule(scheduleData);
      setTimeSlots(timeSlotsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadScheduleData();
  };

  // Handlers for schedule management
  const handleAddAvailability = async (data: CreateAvailabilityDto) => {
    try {
      await availabilityService.createAvailability(data);
      await loadScheduleData(); // Refresh data
    } catch (error) {
      console.error("Error adding availability:", error);
    }
  };

  const handleUpdateAvailability = async (id: string, data: Partial<Availability>) => {
    try {
      await availabilityService.updateAvailability(id, data);
      await loadScheduleData(); // Refresh data
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await availabilityService.deleteAvailability(id);
      await loadScheduleData(); // Refresh data
    } catch (error) {
      console.error("Error deleting availability:", error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getAvailabilityForDay = (date: Date): Availability[] => {
    if (!schedule) return [];
    const weekday = date.getDay();
    return schedule.availabilities.filter(avail => avail.weekday === weekday);
  };

  const renderTimeSlots = () => {
    if (timeSlots.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 mb-4" />
          <p>Aucun créneau disponible pour cette date</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {timeSlots.map((slot, index) => (
          <Card 
            key={index} 
            className={cn(
              "cursor-pointer transition-colors",
              slot.available 
                ? "hover:bg-green-50 border-green-200" 
                : "bg-gray-50 border-gray-200 cursor-not-allowed"
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {format(slot.startAt, "HH:mm")} - {format(slot.endAt, "HH:mm")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {slot.duration} min
                  </span>
                </div>
                <Badge 
                  variant={slot.available ? "default" : "secondary"}
                  className={cn(
                    slot.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {slot.available ? "Libre" : "Occupé"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderWeeklyView = () => {
    if (!schedule) return null;
    
    return (
      <WeeklyScheduleView
        availabilities={schedule.availabilities}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        timeSlots={timeSlots}
        practitionerName={`${schedule.practitioner.firstName} ${schedule.practitioner.lastName}`}
      />
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSlots}</p>
                <p className="text-xs text-muted-foreground">Total créneaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-green-600 rounded-full" />
              <div>
                <p className="text-2xl font-bold">{stats.availableSlots}</p>
                <p className="text-xs text-muted-foreground">Libres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-red-600 rounded-full" />
              <div>
                <p className="text-2xl font-bold">{stats.bookedSlots}</p>
                <p className="text-xs text-muted-foreground">Occupés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.utilizationRate}%</p>
                <p className="text-xs text-muted-foreground">Utilisation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Disponibilités</h2>
          <p className="text-muted-foreground">
            Gérez les horaires et disponibilités des praticiens
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle disponibilité
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Sélectionner un praticien" />
            </SelectTrigger>
            <SelectContent>
              {practitioners.map((practitioner) => (
                <SelectItem key={practitioner.id} value={practitioner.id}>
                  {practitioner.firstName} {practitioner.lastName}
                  {practitioner.specialty && (
                    <span className="text-muted-foreground ml-2">
                      - {practitioner.specialty}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP", { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Statistics */}
      {stats && renderStats()}

      {/* Content Tabs */}
      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="weekly">Vue Hebdomadaire</TabsTrigger>
          <TabsTrigger value="slots">Créneaux du Jour</TabsTrigger>
          <TabsTrigger value="manage">Gestion Horaires</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Calendrier des Disponibilités</CardTitle>
                <CardDescription>
                  Cliquez sur une date pour voir les créneaux disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  locale={fr}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Semaine du {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd MMM yyyy", { locale: fr })}
                </h3>
              </div>
              {renderWeeklyView()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  Créneaux du {format(selectedDate, "PPPP", { locale: fr })}
                </CardTitle>
                <CardDescription>
                  {schedule?.practitioner && (
                    <>Disponibilités de {schedule.practitioner.firstName} {schedule.practitioner.lastName}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTimeSlots()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedPractitioner ? (
            <TimeSlotManager
              practitionerId={selectedPractitioner}
              availabilities={schedule?.availabilities || []}
              onAdd={handleAddAvailability}
              onUpdate={handleUpdateAvailability}
              onDelete={handleDeleteAvailability}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Veuillez sélectionner un praticien pour gérer ses horaires
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}