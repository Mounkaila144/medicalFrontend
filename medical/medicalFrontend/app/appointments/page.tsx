"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Search, Filter } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentCalendarView } from "@/components/appointments/appointment-calendar-view";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appointmentService } from "@/services/appointment-service";
import { Appointment, AppointmentStatus } from "@/types/appointment";

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("list");
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments with params:', {
        date: date,
        status: statusFilter !== "all" ? statusFilter : undefined,
        query: searchQuery || undefined,
      });
      const data = await appointmentService.getAppointments({
        // Don't filter by date by default to show all appointments
        // date: date,
        status: statusFilter !== "all" ? statusFilter : undefined,
        query: searchQuery || undefined,
      });
      console.log('Fetched appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date, statusFilter, searchQuery]);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleAppointmentCreated = () => {
    setIsCreateModalOpen(false);
    fetchAppointments();
  };

  const handleAppointmentUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateAppointment}>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for a patient.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              onSuccess={handleAppointmentCreated}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex w-full sm:w-auto gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hidden md:flex ml-auto">
          <Tabs defaultValue="list" className="w-[400px]" value={view} onValueChange={setView}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="md:hidden w-full">
        <Tabs defaultValue="list" className="w-full" value={view} onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={cn("mt-6", isLoading && "opacity-50")}>
        {view === "list" ? (
          <AppointmentList 
            appointments={appointments} 
            isLoading={isLoading} 
            onAppointmentUpdate={fetchAppointments}
            onAppointmentEdit={handleEditAppointment}
          />
        ) : (
          <AppointmentCalendarView 
            appointments={appointments} 
            date={date} 
            setDate={setDate} 
            isLoading={isLoading}
            onAppointmentEdit={handleEditAppointment}
          />
        )}
      </div>

      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={handleAppointmentUpdated}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}