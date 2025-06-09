"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Mock data - replace with real API calls
const mockStats = {
  totalPatients: 1247,
  todayAppointments: 23,
  pendingInvoices: 8,
  monthlyRevenue: 45680,
  appointmentsByStatus: {
    SCHEDULED: 15,
    CONFIRMED: 8,
    IN_PROGRESS: 2,
    COMPLETED: 18,
    CANCELLED: 3,
  },
  recentPatients: [
    { id: '1', name: 'Marie Dubois', lastVisit: '2024-01-15', status: 'active' },
    { id: '2', name: 'Jean Martin', lastVisit: '2024-01-14', status: 'pending' },
    { id: '3', name: 'Sophie Laurent', lastVisit: '2024-01-13', status: 'active' },
  ],
  upcomingAppointments: [
    {
      id: '1',
      patient: 'Pierre Durand',
      time: '09:00',
      practitioner: 'Dr. Smith',
      type: 'Consultation',
    },
    {
      id: '2',
      patient: 'Anne Moreau',
      time: '10:30',
      practitioner: 'Dr. Johnson',
      type: 'Suivi',
    },
    {
      id: '3',
      patient: 'Marc Leroy',
      time: '14:00',
      practitioner: 'Dr. Brown',
      type: 'Urgence',
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'warning',
      message: '3 factures en retard de paiement',
      action: 'Voir les factures',
    },
    {
      id: '2',
      type: 'info',
      message: '5 nouveaux patients cette semaine',
      action: 'Voir les patients',
    },
  ],
};

export default function DashboardPage() {
  const { user, practitioner, getDisplayName, isLoading } = useAuth();
  const [stats, setStats] = useState(mockStats);

  const displayName = getDisplayName();
  const isPractitioner = !!practitioner;

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Calculate completion rate for today's appointments
  const totalToday = Object.values(stats.appointmentsByStatus).reduce((a, b) => a + b, 0);
  const completedToday = stats.appointmentsByStatus.COMPLETED;
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {displayName} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/patients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau patient
            </Button>
          </Link>
          <Link href="/appointments">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Voir le calendrier
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {completedToday} terminés, {stats.appointmentsByStatus.SCHEDULED + stats.appointmentsByStatus.CONFIRMED} à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en Attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              À traiter rapidement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-orange-500">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consultations terminées</span>
                <span>{completedToday}/{totalToday}</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">En cours</p>
                <p className="font-semibold">{stats.appointmentsByStatus.IN_PROGRESS}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Annulés</p>
                <p className="font-semibold">{stats.appointmentsByStatus.CANCELLED}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prochains RDV
            </CardTitle>
            <CardDescription>Rendez-vous à venir aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.practitioner} • {appointment.type}
                    </p>
                  </div>
                  <Badge variant="outline">{appointment.time}</Badge>
                </div>
              ))}
            </div>
            <Link href="/appointments">
              <Button variant="ghost" className="w-full mt-4">
                Voir tous les RDV
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patients Récents
            </CardTitle>
            <CardDescription>Dernières activités patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                    {patient.status === 'active' ? 'Actif' : 'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/patients">
              <Button variant="ghost" className="w-full mt-4">
                Voir tous les patients
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/patients/new">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Nouveau Patient
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                Planifier RDV
              </Button>
            </Link>
            <Link href="/encounters">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                Nouvelle Consultation
              </Button>
            </Link>
            <Link href="/billing/invoices">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                Créer Facture
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}