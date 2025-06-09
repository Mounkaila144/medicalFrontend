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
import { PatientService } from "@/services/patient.service";
import { PatientForm } from "@/types";

const schema = z.object({
  mrn: z.string().min(1, "MRN requis"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().min(1, "Téléphone requis"),
});

type FormData = z.infer<typeof schema>;

export default function NewPatientPage() {
  const router = useRouter();
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const payload: Partial<PatientForm> = {
        mrn: values.mrn,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      };
      const patient = await PatientService.createPatient(payload as PatientForm);
      router.push(`/patients/${patient.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Nouveau Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mrn"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="mrn">MRN</Label>
                    <FormControl>
                      <Input id="mrn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="firstName">Prénom</Label>
                    <FormControl>
                      <Input id="firstName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="lastName">Nom</Label>
                    <FormControl>
                      <Input id="lastName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="phone">Téléphone</Label>
                    <FormControl>
                      <Input id="phone" {...field} />
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
