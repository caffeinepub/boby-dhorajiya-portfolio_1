import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useGetSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../../hooks/useQueries';
import { SkillCategory } from '../../backend';
import type { Skill } from '../../backend';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

const categoryOptions = [
  { value: SkillCategory.primary, label: 'Primary' },
  { value: SkillCategory.secondary, label: 'Secondary' },
  { value: SkillCategory.security, label: 'Security' },
  { value: SkillCategory.additional, label: 'Additional' },
];

const categoryColors: Record<string, string> = {
  primary: 'default',
  secondary: 'secondary',
  security: 'destructive',
  additional: 'outline',
};

interface SkillFormData {
  name: string;
  experience: string;
  category: SkillCategory;
}

const emptyForm: SkillFormData = {
  name: '',
  experience: '0',
  category: SkillCategory.primary,
};

export default function SkillsManagement() {
  const { data: skills, isLoading } = useGetSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<SkillFormData>(emptyForm);

  const filtered = useMemo(() => {
    if (!skills) return [];
    const q = search.toLowerCase();
    return skills.filter(s => s.name.toLowerCase().includes(q));
  }, [skills, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditingSkill(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      experience: Number(skill.experience).toString(),
      category: skill.category,
    });
    setDialogOpen(true);
  };

  const openDelete = (id: bigint) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const experience = BigInt(parseInt(form.experience, 10) || 0);

    try {
      if (editingSkill) {
        await updateSkill.mutateAsync({
          id: editingSkill.id,
          name: form.name,
          experience,
          category: form.category,
        });
        toast.success('Skill updated!');
      } else {
        await createSkill.mutateAsync({
          name: form.name,
          experience,
          category: form.category,
        });
        toast.success('Skill added!');
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill.';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteSkill.mutateAsync(deletingId);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    toast.success('Skill deleted!');
  };

  const isMutating = createSkill.isPending || updateSkill.isPending;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Skills Management</h1>
                <p className="text-muted-foreground mt-1">Manage your technical skills and expertise</p>
              </div>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>

            {/* Skills Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-xl p-4">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {search ? 'No skills match your search.' : 'No skills yet. Add your first one!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginated.map(skill => (
                  <div
                    key={String(skill.id)}
                    className="border border-border rounded-xl p-4 bg-card flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{skill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={categoryColors[skill.category as string] as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {skill.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{Number(skill.experience)}y</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(skill)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(skill.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
            <DialogDescription>
              {editingSkill ? 'Update the skill details.' : 'Add a new skill to your profile.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. React, TypeScript"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="skill-exp">Years of Experience</Label>
              <Input
                id="skill-exp"
                type="number"
                min="0"
                max="50"
                value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={val => setForm(f => ({ ...f, category: val as SkillCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  editingSkill ? 'Update' : 'Add'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSkill.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Deleting...</>
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
