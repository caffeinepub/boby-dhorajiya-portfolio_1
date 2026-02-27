import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Zap, Search } from 'lucide-react';
import { useGetSkills, useCreateSkill, useUpdateSkill, useDeleteSkill, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import type { Skill } from '../../backend';
import { SkillCategory } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const ITEMS_PER_PAGE = 10;

const categoryLabels: Record<string, string> = {
  [SkillCategory.primary]: 'Primary',
  [SkillCategory.secondary]: 'Secondary',
  [SkillCategory.security]: 'Security',
  [SkillCategory.additional]: 'Additional',
};

interface SkillFormData {
  name: string;
  experience: string;
  category: SkillCategory;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function SkillForm({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: SkillFormData;
  onSubmit: (data: SkillFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<SkillFormData>(initial || { name: '', experience: '1', category: SkillCategory.primary });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skill-name">Skill Name *</Label>
          <Input id="skill-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Flutter" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skill-exp">Years of Experience</Label>
          <Input id="skill-exp" type="number" min="0" max="50" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="1" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={form.category as unknown as string} onValueChange={(v) => setForm({ ...form, category: v as unknown as SkillCategory })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Skill'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function SkillsContent() {
  const { data: skills, isLoading } = useGetSkills();
  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Skill | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (skills ?? []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const openEdit = (skill: Skill) => {
    setEditingItem(skill);
    setForm({ name: skill.name, experience: String(skill.experience), category: skill.category as unknown as SkillCategory });
    setShowForm(true);
  };

  const [form, setForm] = useState<SkillFormData>({ name: '', experience: '1', category: SkillCategory.primary });

  const handleAdd = async (data: SkillFormData) => {
    try {
      await createMutation.mutateAsync({ name: data.name, experience: BigInt(parseInt(data.experience) || 1), category: data.category });
      setShowForm(false);
      toast.success('Skill added!');
    } catch {
      toast.error('Failed to add skill.');
    }
  };

  const handleUpdate = async (data: SkillFormData) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: BigInt(editingItem.id), name: data.name, experience: BigInt(parseInt(data.experience) || 1), category: data.category });
      setEditingItem(null);
      setShowForm(false);
      toast.success('Skill updated!');
    } catch {
      toast.error('Failed to update skill.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Skill deleted!');
    } catch {
      toast.error('Failed to delete skill.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Skills</h1>
              <p className="text-muted-foreground mt-1">Manage your technical skills</p>
            </div>
            {!showForm && (
              <Button onClick={() => { setEditingItem(null); setForm({ name: '', experience: '1', category: SkillCategory.primary }); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">{editingItem ? 'Edit Skill' : 'New Skill'}</h2>
              <SkillForm
                initial={editingItem ? { name: editingItem.name, experience: String(editingItem.experience), category: editingItem.category as unknown as SkillCategory } : undefined}
                onSubmit={editingItem ? handleUpdate : handleAdd}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
                isPending={isPending}
              />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No skills added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((item) => (
                <div key={item.id.toString()} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{Number(item.experience)} yr{Number(item.experience) !== 1 ? 's' : ''}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {categoryLabels[item.category as unknown as string] ?? item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)} aria-label="Edit skill">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete skill">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                          <AlertDialogDescription>Delete "{item.name}"? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(BigInt(item.id))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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

export default function SkillsManagement() {
  return <AdminGuard><SkillsContent /></AdminGuard>;
}
