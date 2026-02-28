import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useListSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../../hooks/useQueries';
import { type Skill, SkillCategory } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const SKILL_CATEGORIES = [
  { value: SkillCategory.primary, label: 'Primary' },
  { value: SkillCategory.secondary, label: 'Secondary' },
  { value: SkillCategory.security, label: 'Security' },
  { value: SkillCategory.additional, label: 'Additional' },
];

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const SkillCard = memo(({ skill, onEdit, onDelete, isDeleting }: SkillCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between py-3">
      <div>
        <CardTitle className="text-base">{skill.name}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {String(skill.experience)} years · {skill.category}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" onClick={() => onEdit(skill)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={() => onDelete(skill.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
));

function SkillsManagementContent() {
  const { data: skills = [], isLoading } = useListSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState({
    name: '',
    experience: '',
    category: SkillCategory.primary as SkillCategory,
  });

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = useCallback(() => {
    setEditingSkill(null);
    setForm({ name: '', experience: '', category: SkillCategory.primary });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((skill: Skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      experience: String(skill.experience),
      category: skill.category,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error('Name is required.');
      return;
    }
    try {
      const experience = BigInt(form.experience || '0');
      if (editingSkill) {
        await updateSkill.mutateAsync({
          id: editingSkill.id,
          name: form.name,
          experience,
          category: form.category,
        });
        toast.success('Skill updated.');
      } else {
        await createSkill.mutateAsync({
          name: form.name,
          experience,
          category: form.category,
        });
        toast.success('Skill created.');
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill.';
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await deleteSkill.mutateAsync(id);
      toast.success('Skill deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete skill.';
      toast.error(msg);
    }
  }, [deleteSkill]);

  const isSaving = createSkill.isPending || updateSkill.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Skills</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Skill
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginated.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No skills found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((skill) => (
                <SkillCard
                  key={String(skill.id)}
                  skill={skill}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteSkill.isPending}
                />
              ))}
            </div>
          )}

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'New Skill'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                min="0"
                value={form.experience}
                onChange={(e) => setForm(f => ({ ...f, experience: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm(f => ({ ...f, category: v as SkillCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SkillsManagement() {
  return (
    <AdminGuard>
      <SkillsManagementContent />
    </AdminGuard>
  );
}
