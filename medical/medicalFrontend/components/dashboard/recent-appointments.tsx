import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentAppointment } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface RecentAppointmentsProps {
  data: RecentAppointment[];
}

export function RecentAppointments({ data }: RecentAppointmentsProps) {
  return (
    <div className="space-y-8">
      {data.map((appointment) => (
        <div key={appointment.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10">
              {appointment.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{appointment.patientName}</p>
            <p className="text-sm text-muted-foreground">
              {appointment.purpose}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm">
              {new Date(appointment.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="flex items-center justify-end">
              <div
                className={`h-2 w-2 rounded-full mr-1 ${
                  appointment.status === "completed"
                    ? "bg-green-500"
                    : appointment.status === "scheduled"
                    ? "bg-blue-500"
                    : "bg-red-500"
                }`}
              />
              <p className="text-xs capitalize text-muted-foreground">
                {appointment.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}