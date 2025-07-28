"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/types/appointment";
import { appointmentService } from "@/services/appointment-service";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointment(id);
        setAppointment(data);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-4">
      <Button variant="outline" onClick={() => router.back()}>
        Retour
      </Button>
      {loading ? (
        <Skeleton className="w-full h-48" />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : appointment ? (
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous #{appointment.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Patient: {appointment.patientName}</p>
            <p>Praticien: {appointment.doctorName}</p>
            <p>Début: {appointment.startTime}</p>
            <p>Fin: {appointment.endTime}</p>
            <p>Statut: {appointment.status}</p>
            {appointment.purpose && <p>Motif: {appointment.purpose}</p>}
            {appointment.notes && <p>Notes: {appointment.notes}</p>}
          </CardContent>
        </Card>
      ) : (
        <div>Aucun rendez-vous trouvé.</div>
      )}
    </div>
  );
}
