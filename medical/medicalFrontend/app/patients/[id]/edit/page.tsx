"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Patient, Gender, BloodType, PatientForm } from "@/types";
import { PatientService } from "@/services/patient.service";

// Form validation schema - based on backend requirements
const patientEditSchema = z.object({
  // Required fields (based on backend @IsNotEmpty())
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
  age: z.number().min(0, 'L\'âge doit être positif').max(150, 'L\'âge doit être réaliste'),
  
  // Optional fields (based on backend @IsOptional())
  mrn: z.string().optional(),
  bloodType: z.nativeEnum(BloodType).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type PatientEditData = z.infer<typeof patientEditSchema>;

export default function PatientEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PatientEditData>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      // Required fields
      firstName: '',
      lastName: '',
      gender: Gender.M,
      age: 0,
      
      // Optional fields
      mrn: '',
      bloodType: undefined,
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    },
  });

  // Load patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await PatientService.getPatientById(id);
        setPatient(data);
        
        // Calculate age from dob if available
        let calculatedAge = 0;
        if (data.dob) {
          const birthDate = new Date(data.dob);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }
        
        // Populate form with patient data
        form.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          gender: data.gender || Gender.M,
          age: calculatedAge,
          mrn: data.mrn || '',
          bloodType: data.bloodType,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'France',
          },
        });
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement du patient");
        toast.error("Erreur lors du chargement du patient");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPatient();
    }
  }, [id, form]);

  const handleUpdatePatient = async (data: PatientEditData) => {
    try {
      setSaving(true);
      
      const patientData: PatientForm = {
        ...data,
        email: data.email || undefined,
        bloodType: data.bloodType || undefined,
        clinicId: patient?.clinicId || '', // Keep existing clinic ID
      };
      
      await PatientService.updatePatient(id, patientData);
      toast.success('Patient mis à jour avec succès');
      router.push(`/patients/${id}`);
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast.error('Erreur lors de la mise à jour du patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-64 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error || "Patient non trouvé"}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/patients')} 
              className="mt-4"
            >
              Retour à la liste des patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier le patient
            </h1>
            <p className="text-gray-600">
              {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
            </p>
          </div>
        </div>
        <Button form="edit-patient-form" type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              id="edit-patient-form"
              onSubmit={form.handleSubmit(handleUpdatePatient)} 
              className="space-y-6"
            >
              {/* Section des champs obligatoires */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-medium text-gray-900">Informations obligatoires</h3>
                  <p className="text-sm text-gray-500">Les champs marqués d'un * sont requis</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
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
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.M}>Homme</SelectItem>
                            <SelectItem value={Gender.F}>Femme</SelectItem>
                            <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Âge *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section des champs optionnels */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>
                  <p className="text-sm text-gray-500">Ces champs sont optionnels</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mrn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRN</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro d'identification médical" {...field} />
                        </FormControl>
                        <FormDescription>
                          Numéro d'identification médical unique
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Groupe sanguin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le groupe sanguin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                          <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                          <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                          <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                          <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                          <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                          <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                          <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section adresse */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                  <p className="text-sm text-gray-500">Informations de contact</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rue</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Rue de la Paix" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>État/Région</FormLabel>
                        <FormControl>
                          <Input placeholder="Île-de-France" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="France" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}