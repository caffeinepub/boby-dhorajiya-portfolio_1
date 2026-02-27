import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Wrench } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetServices, useServiceMutations } from '../../hooks/useQueries';
import type { Service } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface ServiceFormData {
  title: string;
  description: string;
}

function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
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
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Service'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function ServicesContent() {
  const { data: services, isLoading } = useGetServices();
  const { addService, updateService, deleteService } = useServiceMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);

  const handleAdd = async (data: ServiceFormData) => {
    try {
      await addService.mutateAsync(data);
      setShowForm(false);
      toast.success('Service added!');
    } catch {
      toast.error('Failed to add service.');
    }
  };

  const handleUpdate = async (data: ServiceFormData) => {
    if (!editingItem) return;
    try {
      await updateService.mutateAsync({ id: editingItem.id, ...data });
      setEditingItem(null);
      toast.success('Service updated!');
    } catch {
      toast.error('Failed to update service.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteService.mutateAsync(id);
      toast.success('Service deleted.');
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">Services Management</h1>
          </div>
          {!showForm && !editingItem && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New Service</h2>
            <ServiceForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addService.isPending} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : services && services.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No services added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services?.map((item) => (
              <div key={item.id.toString()}>
                {editingItem?.id === item.id ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit Service</h2>
                    <ServiceForm
                      initial={{ title: item.title, description: item.description }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                      isPending={updateService.isPending}
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
                      <button onClick={() => setEditingItem(item)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      </div>
    </div>
  );
}

export default function ServicesManagement() {
  return <AdminGuard><ServicesContent /></AdminGuard>;
}
