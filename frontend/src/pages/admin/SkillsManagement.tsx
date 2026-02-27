import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, TrendingUp } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetSkills, useSkillMutations } from '../../hooks/useQueries';
import type { Skill } from '../../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface SkillFormData {
  name: string;
  experience: string;
}

function SkillForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: SkillFormData;
  onSubmit: (data: SkillFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<SkillFormData>(initial || { name: '', experience: '0' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skill-name">Skill Name *</Label>
          <Input id="skill-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Flutter" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skill-exp">Years of Experience</Label>
          <Input id="skill-exp" type="number" min="0" max="50" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="0" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Skill'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function SkillsContent() {
  const { data: skills, isLoading } = useGetSkills();
  const { addSkill, updateSkill, deleteSkill } = useSkillMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Skill | null>(null);

  const handleAdd = async (data: SkillFormData) => {
    try {
      await addSkill.mutateAsync({ name: data.name, experience: BigInt(parseInt(data.experience) || 0) });
      setShowForm(false);
      toast.success('Skill added!');
    } catch {
      toast.error('Failed to add skill.');
    }
  };

  const handleUpdate = async (data: SkillFormData) => {
    if (!editingItem) return;
    try {
      await updateSkill.mutateAsync({ id: editingItem.id, name: data.name, experience: BigInt(parseInt(data.experience) || 0) });
      setEditingItem(null);
      toast.success('Skill updated!');
    } catch {
      toast.error('Failed to update skill.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteSkill.mutateAsync(id);
      toast.success('Skill deleted.');
    } catch {
      toast.error('Failed to delete skill.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">Skills Management</h1>
          </div>
          {!showForm && !editingItem && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New Skill</h2>
            <SkillForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addSkill.isPending} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : skills && skills.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No skills added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {skills?.map((item) => (
              <div key={item.id.toString()}>
                {editingItem?.id === item.id ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit Skill</h2>
                    <SkillForm
                      initial={{ name: item.name, experience: Number(item.experience).toString() }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                      isPending={updateSkill.isPending}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        {Number(item.experience) > 0 && (
                          <p className="text-xs text-muted-foreground">{Number(item.experience)} year{Number(item.experience) !== 1 ? 's' : ''} experience</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                            <AlertDialogDescription>Delete "{item.name}"? This cannot be undone.</AlertDialogDescription>
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

export default function SkillsManagement() {
  return <AdminGuard><SkillsContent /></AdminGuard>;
}
