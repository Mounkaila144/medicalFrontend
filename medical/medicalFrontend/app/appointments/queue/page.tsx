'use client';

import { useState, useEffect } from 'react';
import { AppointmentService } from '@/services/appointment.service';
import { PatientService } from '@/services/patient.service';
import { practitionersService, Practitioner as PractitionerService } from '@/services/practitioners-service';
import { WaitQueueEntry, Priority, Patient, Practitioner } from '@/types/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Users,
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Timer,
  UserCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddToQueueForm {
  patientId: string;
  practitionerId: string;
  priority: Priority;
  reason: string;
}

export default function AppointmentsQueuePage() {
  const [queueEntries, setQueueEntries] = useState<WaitQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitQueueEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddToQueueForm>({
    patientId: '',
    practitionerId: '',
    priority: Priority.NORMAL,
    reason: ''
  });
  
  // États pour les listes de patients et praticiens
  const [patients, setPatients] = useState<Patient[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerService[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingPractitioners, setLoadingPractitioners] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [practitionerSearch, setPractitionerSearch] = useState('');
  
  const { toast } = useToast();

  const fetchQueue = async () => {
    try {
      setRefreshing(true);
      const data = await AppointmentService.getWaitQueue();
      setQueueEntries(data);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la file d\'attente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    loadPractitioners();
  }, []);

  const loadPatients = async (search: string = '') => {
    try {
      setLoadingPatients(true);
      const result = await PatientService.searchPatients(search);
      setPatients(result);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les patients',
        variant: 'destructive',
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadPractitioners = async () => {
    try {
      setLoadingPractitioners(true);
      const result = await practitionersService.getPractitioners();
      setPractitioners(result);
    } catch (error) {
      console.error('Error loading practitioners:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les praticiens',
        variant: 'destructive',
      });
    } finally {
      setLoadingPractitioners(false);
    }
  };

  const handlePatientSearch = async (search: string) => {
    setPatientSearch(search);
    if (search.length >= 2) {
      await loadPatients(search);
    } else {
      setPatients([]);
    }
  };

  const handlePractitionerSearch = (search: string) => {
    setPractitionerSearch(search);
  };

  const getFilteredPractitioners = () => {
    if (!practitionerSearch) return practitioners;
    return practitioners.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(practitionerSearch.toLowerCase()) ||
      p.specialty?.toLowerCase().includes(practitionerSearch.toLowerCase())
    );
  };

  const handleAddToQueue = async () => {
    try {
      await AppointmentService.addToWaitQueue(addForm);
      toast({
        title: 'Succès',
        description: 'Patient ajouté à la file d\'attente',
      });
      setIsAddDialogOpen(false);
      setAddForm({
        patientId: '',
        practitionerId: '',
        priority: Priority.NORMAL,
        reason: ''
      });
      setPatientSearch('');
      setPractitionerSearch('');
      setPatients([]);
      await fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le patient à la file d\'attente',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEntry = async (id: string, updates: Partial<WaitQueueEntry>) => {
    try {
      await AppointmentService.updateWaitQueueEntry(id, updates);
      toast({
        title: 'Succès',
        description: 'Entrée mise à jour',
      });
      await fetchQueue();
    } catch (error) {
      console.error('Error updating queue entry:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'entrée',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromQueue = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient de la file d\'attente ?')) {
      return;
    }
    
    try {
      await AppointmentService.removeFromWaitQueue(id);
      toast({
        title: 'Succès',
        description: 'Patient retiré de la file d\'attente',
      });
      await fetchQueue();
    } catch (error) {
      console.error('Error removing from queue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le patient de la file d\'attente',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSeenFromQueue = async (id: string) => {
    try {
      // Marquer comme pris en charge - on pourrait ajouter un statut dans l'API
      await AppointmentService.removeFromWaitQueue(id);
      toast({
        title: 'Succès',
        description: 'Patient marqué comme pris en charge',
      });
      await fetchQueue();
    } catch (error) {
      console.error('Error marking as seen:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le patient comme pris en charge',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.NORMAL:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Priority.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return <AlertTriangle className="h-4 w-4" />;
      case Priority.HIGH:
        return <ArrowUp className="h-4 w-4" />;
      case Priority.NORMAL:
        return <Timer className="h-4 w-4" />;
      case Priority.LOW:
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Timer className="h-4 w-4" />;
    }
  };

  const formatPriority = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return 'Urgent';
      case Priority.HIGH:
        return 'Élevée';
      case Priority.NORMAL:
        return 'Normale';
      case Priority.LOW:
        return 'Faible';
      default:
        return 'Normale';
    }
  };

  const getWaitingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}min`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File d'attente</h1>
          <p className="text-gray-600 mt-1">
            Gérez les patients en attente de consultation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchQueue}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  // Réinitialiser les états quand on ouvre le dialogue
                  setAddForm({
                    patientId: '',
                    practitionerId: '',
                    priority: Priority.NORMAL,
                    reason: ''
                  });
                  setPatientSearch('');
                  setPractitionerSearch('');
                  setPatients([]);
                }}
              >
                <Plus className="h-4 w-4" />
                Ajouter à la file
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un patient à la file d'attente</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour ajouter un patient à la file d'attente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={addForm.patientId}
                    onValueChange={(value) => setAddForm({ ...addForm, patientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Rechercher un patient..."
                          value={patientSearch}
                          onChange={(e) => handlePatientSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {loadingPatients ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Chargement...
                        </div>
                      ) : patients.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          {patientSearch.length >= 2 ? 'Aucun patient trouvé' : 'Tapez au moins 2 caractères'}
                        </div>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span>{patient.firstName} {patient.lastName}</span>
                              <span className="text-xs text-gray-500">MRN: {patient.mrn}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="practitionerId">Praticien</Label>
                  <Select
                    value={addForm.practitionerId}
                    onValueChange={(value) => setAddForm({ ...addForm, practitionerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un praticien" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Rechercher un praticien..."
                          value={practitionerSearch}
                          onChange={(e) => handlePractitionerSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {loadingPractitioners ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Chargement...
                        </div>
                      ) : getFilteredPractitioners().length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Aucun praticien trouvé
                        </div>
                      ) : (
                        getFilteredPractitioners().map((practitioner) => (
                          <SelectItem key={practitioner.id} value={practitioner.id}>
                            <div className="flex flex-col">
                              <span>Dr. {practitioner.firstName} {practitioner.lastName}</span>
                              <span className="text-xs text-gray-500">{practitioner.specialty}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    value={addForm.priority}
                    onValueChange={(value) => setAddForm({ ...addForm, priority: value as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Priority.LOW}>Faible</SelectItem>
                      <SelectItem value={Priority.NORMAL}>Normale</SelectItem>
                      <SelectItem value={Priority.HIGH}>Élevée</SelectItem>
                      <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Motif</Label>
                  <Textarea
                    id="reason"
                    value={addForm.reason}
                    onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                    placeholder="Décrivez le motif de la consultation"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setPatientSearch('');
                      setPractitionerSearch('');
                      setPatients([]);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleAddToQueue}
                    disabled={!addForm.patientId || !addForm.practitionerId || !addForm.reason.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total en attente</p>
                <p className="text-2xl font-bold text-gray-900">{queueEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueEntries.filter(entry => entry.priority === Priority.URGENT).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Priorité élevée</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueEntries.filter(entry => entry.priority === Priority.HIGH).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps d'attente moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueEntries.length > 0 
                    ? Math.round(queueEntries.reduce((sum, entry) => {
                        const waitTime = Math.floor((new Date().getTime() - new Date(entry.createdAt).getTime()) / (1000 * 60));
                        return sum + waitTime;
                      }, 0) / queueEntries.length)
                    : 0}min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            File d'attente actuelle
          </CardTitle>
          <CardDescription>
            Patients en attente de consultation, triés par priorité et heure d'arrivée
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queueEntries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun patient en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueEntries
                .sort((a, b) => {
                  // Sort by priority first, then by creation time
                  const priorityOrder = { [Priority.URGENT]: 4, [Priority.HIGH]: 3, [Priority.NORMAL]: 2, [Priority.LOW]: 1 };
                  const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                  if (priorityDiff !== 0) return priorityDiff;
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                })
                .map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {entry.patient ? `${entry.patient.firstName} ${entry.patient.lastName}` : `Patient ID: ${entry.patientId}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Praticien: {entry.practitioner ? `Dr. ${entry.practitioner.firstName} ${entry.practitioner.lastName}` : entry.practitionerId}
                          </p>
                          <p className="text-sm text-gray-600">Motif: {entry.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={`${getPriorityColor(entry.priority)} flex items-center gap-1`}>
                          {getPriorityIcon(entry.priority)}
                          {formatPriority(entry.priority)}
                        </Badge>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Temps d'attente</p>
                          <p className="font-semibold text-gray-900">{getWaitingTime(entry.createdAt)}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Arrivée</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(entry.createdAt), 'HH:mm', { locale: fr })}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Select
                            value={entry.priority}
                            onValueChange={(value) => handleUpdateEntry(entry.id, { priority: value as Priority })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Priority.LOW}>Faible</SelectItem>
                              <SelectItem value={Priority.NORMAL}>Normale</SelectItem>
                              <SelectItem value={Priority.HIGH}>Élevée</SelectItem>
                              <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setIsEditDialogOpen(true);
                              // Charger le patient actuel si disponible
                              if (entry.patient) {
                                setPatients([entry.patient]);
                                setPatientSearch(`${entry.patient.firstName} ${entry.patient.lastName}`);
                              }
                            }}
                            title="Modifier l'entrée"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsSeenFromQueue(entry.id)}
                            title="Marquer comme pris en charge"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveFromQueue(entry.id)}
                            title="Supprimer de la file d'attente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {entry.estimatedWaitTime && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          Temps d'attente estimé: <span className="font-semibold">{entry.estimatedWaitTime} min</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'entrée de la file d'attente</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'entrée sélectionnée.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-patient">Patient</Label>
                <Select
                  value={selectedEntry.patientId}
                  onValueChange={(value) => setSelectedEntry({ ...selectedEntry, patientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Rechercher un patient..."
                        value={patientSearch}
                        onChange={(e) => handlePatientSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {loadingPatients ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Chargement...
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        {patientSearch.length >= 2 ? 'Aucun patient trouvé' : 'Tapez au moins 2 caractères'}
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span>{patient.firstName} {patient.lastName}</span>
                            <span className="text-xs text-gray-500">MRN: {patient.mrn}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                    {/* Toujours afficher le patient actuel en premier */}
                    {selectedEntry.patient && (
                      <SelectItem value={selectedEntry.patientId}>
                        <div className="flex flex-col">
                          <span>{selectedEntry.patient.firstName} {selectedEntry.patient.lastName}</span>
                          <span className="text-xs text-gray-500">MRN: {selectedEntry.patient.mrn} (Actuel)</span>
                        </div>
                      </SelectItem>
                    )}
                    {/* Autres patients de la recherche */}
                    {patients.filter(p => p.id !== selectedEntry.patientId).map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex flex-col">
                          <span>{patient.firstName} {patient.lastName}</span>
                          <span className="text-xs text-gray-500">MRN: {patient.mrn}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-practitioner">Praticien</Label>
                <Select
                  value={selectedEntry.practitionerId}
                  onValueChange={(value) => setSelectedEntry({ ...selectedEntry, practitionerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un praticien" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Rechercher un praticien..."
                        value={practitionerSearch}
                        onChange={(e) => handlePractitionerSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {loadingPractitioners ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Chargement...
                      </div>
                    ) : (
                      <>
                        {/* Toujours afficher le praticien actuel en premier */}
                        {selectedEntry.practitioner && (
                          <SelectItem value={selectedEntry.practitionerId}>
                            <div className="flex flex-col">
                              <span>Dr. {selectedEntry.practitioner.firstName} {selectedEntry.practitioner.lastName}</span>
                              <span className="text-xs text-gray-500">{selectedEntry.practitioner.specialty} (Actuel)</span>
                            </div>
                          </SelectItem>
                        )}
                        {/* Autres praticiens de la liste filtrée */}
                        {getFilteredPractitioners().filter(p => p.id !== selectedEntry.practitionerId).length === 0 && !selectedEntry.practitioner ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            Aucun praticien trouvé
                          </div>
                        ) : (
                          getFilteredPractitioners().filter(p => p.id !== selectedEntry.practitionerId).map((practitioner) => (
                            <SelectItem key={practitioner.id} value={practitioner.id}>
                              <div className="flex flex-col">
                                <span>Dr. {practitioner.firstName} {practitioner.lastName}</span>
                                <span className="text-xs text-gray-500">{practitioner.specialty}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Priorité</Label>
                <Select
                  value={selectedEntry.priority}
                  onValueChange={(value) => setSelectedEntry({ ...selectedEntry, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.LOW}>Faible</SelectItem>
                    <SelectItem value={Priority.NORMAL}>Normale</SelectItem>
                    <SelectItem value={Priority.HIGH}>Élevée</SelectItem>
                    <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-reason">Motif</Label>
                <Textarea
                  id="edit-reason"
                  value={selectedEntry.reason}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry, reason: e.target.value })}
                  placeholder="Décrivez le motif de la consultation"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setPatientSearch('');
                    setPractitionerSearch('');
                    setPatients([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateEntry(selectedEntry.id, {
                      patientId: selectedEntry.patientId,
                      practitionerId: selectedEntry.practitionerId,
                      priority: selectedEntry.priority,
                      reason: selectedEntry.reason
                    });
                    setIsEditDialogOpen(false);
                  }}
                  disabled={!selectedEntry.patientId || !selectedEntry.practitionerId || !selectedEntry.reason.trim()}
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}