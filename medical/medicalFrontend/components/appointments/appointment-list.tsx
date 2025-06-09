import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/types/appointment";
import { MoreHorizontal, Edit, File, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
}

export function AppointmentList({ appointments, isLoading }: AppointmentListProps) {
  const router = useRouter();
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  const handleViewDetails = (appointmentId: string) => {
    router.push(`/appointments/${appointmentId}`);
  };

  const handleEdit = (appointmentId: string) => {
    router.push(`/appointments/${appointmentId}/edit`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "no-show":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "canceled":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "no-show":
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No appointments found</h3>
        <p className="text-muted-foreground mt-2">
          There are no appointments matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id} onClick={() => setExpandedAppointment(expandedAppointment === appointment.id ? null : appointment.id)} className="cursor-pointer">
              <TableCell>
                {format(new Date(appointment.startTime), "h:mm a")}
              </TableCell>
              <TableCell className="font-medium">{appointment.patientName}</TableCell>
              <TableCell>{appointment.doctorName}</TableCell>
              <TableCell>{appointment.purpose}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getStatusIcon(appointment.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(appointment.id);
                    }}>
                      <File className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(appointment.id);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={appointment.status === "completed"}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as completed
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={appointment.status === "canceled"}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}