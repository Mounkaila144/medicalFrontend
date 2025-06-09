"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { AppointmentService } from "@/services/appointment.service";
import { AppointmentForm } from "@/types";

const schema = z.object({
  patientId: z.string().min(1, "Patient requis"),
  practitionerId: z.string().min(1, "Praticien requis"),
  startAt: z.string().min(1, "Date de début requise"),
  endAt: z.string().min(1, "Date de fin requise"),
  reason: z.string().min(1, "Motif requis"),
});

type FormData = z.infer<typeof schema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const payload: AppointmentForm = {
        patientId: values.patientId,
        practitionerId: values.practitionerId,
        startAt: values.startAt,
        endAt: values.endAt,
        reason: values.reason,
      };
      const appointment = await AppointmentService.createAppointment(payload);
      router.push(`/appointments/${appointment.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Nouveau Rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <FormControl>
                      <Input id="patientId" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="practitionerId"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="practitionerId">Praticien ID</Label>
                    <FormControl>
                      <Input id="practitionerId" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="startAt">Début</Label>
                    <FormControl>
                      <Input id="startAt" type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="endAt">Fin</Label>
                    <FormControl>
                      <Input id="endAt" type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="reason">Motif</Label>
                    <FormControl>
                      <Input id="reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Créer</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
