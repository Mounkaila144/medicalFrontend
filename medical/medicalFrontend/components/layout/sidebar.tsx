'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Users,
  Calendar,
  UserCheck,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Stethoscope,
  ClipboardList,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  UserPlus,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  roles?: string[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Patients',
    icon: Users,
    children: [
      { title: 'Liste des patients', href: '/patients', icon: Users },
      { title: 'Nouveau patient', href: '/patients/new', icon: Users },
    ],
  },
  {
    title: 'Planification',
    icon: Calendar,
    children: [
      { title: 'Calendrier', href: '/appointments', icon: Calendar },
      { title: 'File d\'attente', href: '/appointments/queue', icon: Clock },
      { title: 'Disponibilités', href: '/appointments/availability', icon: Calendar },
    ],
  },
  {
    title: 'Praticiens',
    href: '/practitioners',
    icon: UserCheck,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'],
  },
  {
    title: 'Consultations',
    icon: Stethoscope,
    children: [
      { title: 'Encounters', href: '/encounters', icon: FileText },
      { title: 'Prescriptions', href: '/encounters/prescriptions', icon: ClipboardList },
      { title: 'Résultats labo', href: '/encounters/labs', icon: FileText },
    ],
  },
  {
    title: 'Facturation',
    icon: DollarSign,
    children: [
      { title: 'Factures', href: '/billing/invoices', icon: FileText },
      { title: 'Paiements', href: '/billing/payments', icon: DollarSign },
      { title: 'Tarifs', href: '/billing/tariffs', icon: DollarSign },
    ],
  },
  {
    title: 'Rapports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Gestion Utilisateurs',
    icon: Shield,
    roles: ['SUPERADMIN'],
    children: [
      { title: 'Tenants & Cliniques', href: '/admin/tenants', icon: Building },
      { title: 'Utilisateurs', href: '/admin/users', icon: UserPlus },
      { title: 'Permissions', href: '/admin/permissions', icon: Shield },
    ],
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'],
  },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole, getUserType } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 h-auto font-normal",
                level > 0 && "ml-4",
                "hover:bg-blue-50 hover:text-blue-700"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.title} href={item.href!}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 h-auto font-normal",
            level > 0 && "ml-4",
            isActive(item.href!) 
              ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700" 
              : "hover:bg-blue-50 hover:text-blue-700"
          )}
          onClick={() => onOpenChange(false)}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{item.title}</span>
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-4 py-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">MedClinic</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {navigation.map(item => renderNavItem(item))}
              </div>
            </ScrollArea>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-4 py-6">
          {/* Header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MedClinic</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {navigation.map(item => renderNavItem(item))}
              </div>
            </ScrollArea>
          </nav>
        </div>
      </div>
    </>
  );
}