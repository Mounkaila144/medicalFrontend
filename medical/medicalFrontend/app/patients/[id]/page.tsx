"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types";
import { PatientService } from "@/services/patient.service";

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await PatientService.getPatientById(id);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
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
      ) : patient ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {patient.firstName} {patient.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>ID: {patient.id}</p>
            <p>MRN: {patient.mrn}</p>
            <p>Téléphone: {patient.phone}</p>
            {patient.email && <p>Email: {patient.email}</p>}
            <p>Date de naissance: {patient.dob}</p>
            <p>Genre: {patient.gender}</p>
          </CardContent>
        </Card>
      ) : (
        <div>Aucun patient trouvé.</div>
      )}
    </div>
  );
}
