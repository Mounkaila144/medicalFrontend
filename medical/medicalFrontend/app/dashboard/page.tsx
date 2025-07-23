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
import { dashboardService } from '@/services/dashboard-service';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, practitioner, getDisplayName, isLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = getDisplayName();
  const isPractitioner = !!practitioner;

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Show loading state while auth is initializing or data is loading
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // If no data loaded yet
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Calculate completion rate for today's appointments
  const appointmentsByStatus = stats.appointmentsByStatus || {};
  const totalToday = Object.values(appointmentsByStatus).reduce((a, b) => (a || 0) + (b || 0), 0);
  const completedToday = appointmentsByStatus.COMPLETED || 0;
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
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau patient
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Voir le calendrier
            </Link>
          </Button>
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
            <div className="text-2xl font-bold">{(stats.totalPatients || 0).toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{stats.appointmentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedToday} terminés, {(appointmentsByStatus.SCHEDULED || 0) + (appointmentsByStatus.CONFIRMED || 0)} à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.monthlyRevenue || 0).toLocaleString()} €</div>
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
            <div className="text-2xl font-bold">{stats.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              À traiter rapidement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.alerts || []).length > 0 && (
        <div className="space-y-2">
          {(stats.alerts || []).map((alert) => (
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
                <p className="font-semibold">{appointmentsByStatus.IN_PROGRESS || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Annulés</p>
                <p className="font-semibold">{appointmentsByStatus.CANCELLED || 0}</p>
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
              {(stats.upcomingAppointments || []).slice(0, 3).map((appointment) => (
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
              {(stats.upcomingAppointments || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun rendez-vous programmé aujourd'hui
                </p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/appointments">
                Voir tous les RDV
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rendez-vous Récents
            </CardTitle>
            <CardDescription>Derniers rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats.recentAppointments || []).slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{appointment.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.purpose} • {new Date(appointment.time).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                    {appointment.status === 'completed' ? 'Terminé' : 
                     appointment.status === 'scheduled' ? 'Programmé' : 
                     appointment.status === 'cancelled' ? 'Annulé' : appointment.status}
                  </Badge>
                </div>
              ))}
              {(stats.recentAppointments || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun rendez-vous récent
                </p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/appointments">
                Voir tous les RDV
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
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
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/patients/new">
                <Users className="h-6 w-6" />
                Nouveau Patient
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/appointments">
                <Calendar className="h-6 w-6" />
                Planifier RDV
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/encounters">
                <FileText className="h-6 w-6" />
                Nouvelle Consultation
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-20 flex-col gap-2" asChild>
              <Link href="/billing/invoices">
                <DollarSign className="h-6 w-6" />
                Créer Facture
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}