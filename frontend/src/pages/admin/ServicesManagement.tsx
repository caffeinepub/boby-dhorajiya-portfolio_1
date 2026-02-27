import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Wrench, Search } from 'lucide-react';
import { useGetServices, useAddService, useUpdateService, useDeleteService, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import type { Service } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const ITEMS_PER_PAGE = 10;

interface ServiceFormData {
  title: string;
  description: string;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function ServiceForm({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: ServiceFormData;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ServiceFormData>(initial || { title: '', description: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="svc-title">Service Title *</Label>
        <Input id="svc-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Flutter App Development" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="svc-desc">Description *</Label>
        <Textarea id="svc-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the service..." rows={4} required />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ServicesContent() {
  const { data: services, isLoading } = useGetServices();
  const addServiceMutation = useAddService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (services ?? []).filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleAdd = async (data: ServiceFormData) => {
    try {
      await addServiceMutation.mutateAsync(data);
      setShowForm(false);
      toast.success('Service added!');
    } catch {
      toast.error('Failed to add service.');
    }
  };

  const handleUpdate = async (data: ServiceFormData) => {
    if (!editingItem) return;
    try {
      await updateServiceMutation.mutateAsync({ id: editingItem.id, ...data });
      setEditingItem(null);
      toast.success('Service updated!');
    } catch {
      toast.error('Failed to update service.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast.success('Service deleted.');
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Services</h1>
              <p className="text-muted-foreground mt-1">Manage your service offerings</p>
            </div>
            {!showForm && !editingItem && (
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">New Service</h2>
              <ServiceForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addServiceMutation.isPending} />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No services added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((item) => (
                <div key={item.id.toString()}>
                  {editingItem?.id === item.id ? (
                    <div>
                      <h2 className="font-semibold mb-3">Edit Service</h2>
                      <ServiceForm
                        initial={{ title: item.title, description: item.description }}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingItem(null)}
                        isPending={updateServiceMutation.isPending}
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditingItem(item)} aria-label="Edit service">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete service">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Service</AlertDialogTitle>
                              <AlertDialogDescription>Delete "{item.title}"? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ServicesManagement() {
  return <AdminGuard><ServicesContent /></AdminGuard>;
}
