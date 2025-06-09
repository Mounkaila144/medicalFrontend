'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Shield,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PermissionsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuth()) {
      setError('Vous devez être connecté pour accéder aux permissions');
      toast.error('Veuillez vous connecter pour continuer');
      setTimeout(() => router.push('/auth/login'), 2000);
    }
  }, []);

  if (!isAuthenticated && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <CardTitle>Authentification requise</CardTitle>
              <CardDescription>
                Vous devez être connecté en tant que SUPERADMIN pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
          <p className="text-gray-600 mt-1">
            Gérez les permissions et rôles des utilisateurs
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={!isAuthenticated}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Permissions
          </CardTitle>
          <CardDescription>
            Configurez les permissions granulaires pour chaque utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Fonctionnalité en développement
            </h3>
            <p className="text-gray-600 mb-4">
              La gestion granulaire des permissions sera disponible après la finalisation de l'API backend.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités prévues :</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Permissions par module (Patients, RDV, Facturation...)</li>
                <li>• Attribution de rôles prédéfinis</li>
                <li>• Permissions personnalisées par utilisateur</li>
                <li>• Héritage des permissions par tenant</li>
                <li>• Audit des changements de permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
