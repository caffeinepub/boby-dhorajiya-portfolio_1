import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Briefcase, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import {
  useGetExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
} from '../../hooks/useQueries';
import { Experience } from '../../backend';

const ITEMS_PER_PAGE = 6;

interface ExperienceFormData {
  title: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
}

const emptyForm: ExperienceFormData = {
  title: '',
  company: '',
  period: '',
  description: '',
  responsibilities: [''],
};

export default function ExperienceManagement() {
  const { data: experiences, isLoading } = useGetExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ExperienceFormData>(emptyForm);

  const filtered = useMemo(() => {
    if (!experiences) return [];
    const q = search.toLowerCase();
    return experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q)
    );
  }, [experiences, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditingExperience(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setForm({
      title: exp.title,
      company: exp.company,
      period: exp.period,
      description: exp.description,
      responsibilities: exp.responsibilities.length > 0 ? [...exp.responsibilities] : [''],
    });
    setDialogOpen(true);
  };

  const openDelete = (id: bigint) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const responsibilities = form.responsibilities.filter((r) => r.trim() !== '');

    if (editingExperience) {
      await updateExperience.mutateAsync({
        id: editingExperience.id,
        title: form.title,
        company: form.company,
        period: form.period,
        description: form.description,
        responsibilities,
      });
    } else {
      await createExperience.mutateAsync({
        title: form.title,
        company: form.company,
        period: form.period,
        description: form.description,
        responsibilities,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteExperience.mutateAsync(deletingId);
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const addResponsibility = () => {
    setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, ''] }));
  };

  const removeResponsibility = (idx: number) => {
    setForm((f) => ({
      ...f,
      responsibilities: f.responsibilities.filter((_, i) => i !== idx),
    }));
  };

  const updateResponsibility = (idx: number, value: string) => {
    setForm((f) => {
      const updated = [...f.responsibilities];
      updated[idx] = value;
      return { ...f, responsibilities: updated };
    });
  };

  const isMutating = createExperience.isPending || updateExperience.isPending;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Experience Management</h1>
                <p className="text-muted-foreground mt-1">Manage your work experience entries</p>
              </div>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border rounded-xl p-5">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {search ? 'No results found' : 'No experiences yet'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {search ? 'Try a different search term.' : 'Click "Add Experience" to get started.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {paginated.map((exp) => (
                  <div
                    key={String(exp.id)}
                    className="border border-border rounded-xl p-5 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg">{exp.title}</h3>
                        <p className="text-primary text-sm font-medium">{exp.company}</p>
                        <p className="text-muted-foreground text-sm mt-0.5">{exp.period}</p>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{exp.description}</p>
                        {exp.responsibilities.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exp.responsibilities.length} responsibilit{exp.responsibilities.length === 1 ? 'y' : 'ies'}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="icon" onClick={() => openEdit(exp)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDelete(exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            <DialogDescription>
              {editingExperience ? 'Update the experience details below.' : 'Fill in the details for the new experience entry.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Mobile App Developer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                placeholder="e.g. Jan 2022 – Present"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of your role..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Responsibilities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addResponsibility} className="gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={resp}
                      onChange={(e) => updateResponsibility(idx, e.target.value)}
                      placeholder={`Responsibility ${idx + 1}`}
                    />
                    {form.responsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeResponsibility(idx)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingExperience ? 'Save Changes' : 'Create Experience'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experience entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExperience.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
}
