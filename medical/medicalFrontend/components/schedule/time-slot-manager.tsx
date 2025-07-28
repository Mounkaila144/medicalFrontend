"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Edit, Trash2, Clock, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Availability, RepeatType, CreateAvailabilityDto } from "@/types/schedule";

interface TimeSlotManagerProps {
  practitionerId: string;
  availabilities: Availability[];
  onAdd: (data: CreateAvailabilityDto) => Promise<void>;
  onUpdate: (id: string, data: Partial<Availability>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

interface TimeSlotForm {
  weekday: number;
  start: string;
  end: string;
  repeat: RepeatType;
}

const WEEKDAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

export function TimeSlotManager({
  practitionerId,
  availabilities,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
}: TimeSlotManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimeSlotForm>({
    weekday: 1,
    start: "09:00",
    end: "17:00",
    repeat: RepeatType.WEEKLY,
  });

  const getWeekdayLabel = (weekday: number) => {
    return WEEKDAYS.find(day => day.value === weekday)?.label || "Unknown";
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onAdd({
          practitionerId,
          ...formData,
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  const handleEdit = (availability: Availability) => {
    setEditingId(availability.id);
    setFormData({
      weekday: availability.weekday,
      start: availability.start,
      end: availability.end,
      repeat: availability.repeat,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette disponibilité ?")) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting availability:", error);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      weekday: 1,
      start: "09:00",
      end: "17:00",
      repeat: RepeatType.WEEKLY,
    });
  };

  const groupedAvailabilities = availabilities.reduce((acc, availability) => {
    if (!acc[availability.weekday]) {
      acc[availability.weekday] = [];
    }
    acc[availability.weekday].push(availability);
    return acc;
  }, {} as Record<number, Availability[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestion des Horaires</h3>
          <p className="text-sm text-muted-foreground">
            Définissez les créneaux de disponibilité du praticien
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Créneau
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifier" : "Ajouter"} un Créneau
              </DialogTitle>
              <DialogDescription>
                Définissez les heures de disponibilité pour un jour de la semaine.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weekday" className="text-right">
                  Jour
                </Label>
                <Select
                  value={formData.weekday.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, weekday: parseInt(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start" className="text-right">
                  Début
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={formData.start}
                  onChange={(e) =>
                    setFormData({ ...formData, start: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end" className="text-right">
                  Fin
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={formData.end}
                  onChange={(e) =>
                    setFormData({ ...formData, end: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="repeat" className="text-right">
                  Répétition
                </Label>
                <Select
                  value={formData.repeat}
                  onValueChange={(value: RepeatType) =>
                    setFormData({ ...formData, repeat: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RepeatType.WEEKLY}>Hebdomadaire</SelectItem>
                    <SelectItem value={RepeatType.BIWEEKLY}>Bi-hebdomadaire</SelectItem>
                    <SelectItem value={RepeatType.MONTHLY}>Mensuel</SelectItem>
                    <SelectItem value={RepeatType.NONE}>Aucune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {WEEKDAYS.map((day) => {
          const dayAvailabilities = groupedAvailabilities[day.value] || [];
          
          return (
            <Card key={day.value}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {day.label}
                </CardTitle>
                {dayAvailabilities.length === 0 && (
                  <CardDescription>Aucune disponibilité définie</CardDescription>
                )}
              </CardHeader>
              {dayAvailabilities.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {dayAvailabilities.map((availability) => (
                      <div
                        key={availability.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">
                            {availability.start} - {availability.end}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {availability.repeat === RepeatType.WEEKLY ? "Hebdo" :
                             availability.repeat === RepeatType.BIWEEKLY ? "Bi-hebdo" :
                             availability.repeat === RepeatType.MONTHLY ? "Mensuel" : "Unique"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(availability)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(availability.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}