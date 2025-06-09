'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  appointments: 'Rendez-vous',
  practitioners: 'Praticiens',
  encounters: 'Consultations',
  billing: 'Facturation',
  reports: 'Rapports',
  admin: 'Administration',
  new: 'Nouveau',
  edit: 'Modifier',
  queue: 'File d\'attente',
  availability: 'Disponibilités',
  prescriptions: 'Prescriptions',
  labs: 'Résultats labo',
  invoices: 'Factures',
  payments: 'Paiements',
  tariffs: 'Tarifs',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname || pathname === '/') {
      return [{ label: 'Dashboard', href: '/dashboard' }];
    }

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      
      // Don't add href for the last item (current page)
      const isLast = index === segments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  index === 0 ? "text-gray-500" : "text-gray-700"
                )}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 