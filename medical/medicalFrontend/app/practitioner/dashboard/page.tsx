"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

export default function PractitionerDashboard() {
  const { practitioner, getDisplayName } = useAuth();

  if (!practitioner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Accès non autorisé</h2>
          <p className="text-gray-600">Vous devez être connecté en tant que praticien.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord - {getDisplayName()}
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace praticien
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Praticien
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              RDV Aujourd'hui
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patients Actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consultations
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temps Moyen
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25min</div>
            <p className="text-xs text-muted-foreground">
              Par consultation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochains RDV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prochains Rendez-vous
            </CardTitle>
            <CardDescription>
              Vos rendez-vous pour aujourd'hui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Marie Dubois</p>
                  <p className="text-sm text-gray-600">Consultation de suivi</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">09:30</p>
                  <Badge variant="outline">Confirmé</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Jean Martin</p>
                  <p className="text-sm text-gray-600">Première consultation</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">10:15</p>
                  <Badge variant="outline">Nouveau</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Sophie Leroy</p>
                  <p className="text-sm text-gray-600">Contrôle post-opératoire</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">11:00</p>
                  <Badge variant="outline">Urgent</Badge>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              Voir tous les rendez-vous
            </Button>
          </CardContent>
        </Card>

        {/* Activité Récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Vos dernières actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Consultation terminée</p>
                  <p className="text-xs text-gray-600">Patient: Pierre Durand - Il y a 30 min</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Ordonnance créée</p>
                  <p className="text-xs text-gray-600">Patient: Anne Moreau - Il y a 1h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">RDV reporté</p>
                  <p className="text-xs text-gray-600">Patient: Marc Petit - Il y a 2h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Dossier mis à jour</p>
                  <p className="text-xs text-gray-600">Patient: Claire Rousseau - Il y a 3h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Nouveau RDV</span>
            </Button>
            
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span className="text-sm">Nouveau Patient</span>
            </Button>
            
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Consultation</span>
            </Button>
            
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Statistiques</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 