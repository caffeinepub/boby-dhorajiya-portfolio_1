import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetSeoSettings, useSeoMutations } from '../../hooks/useQueries';
import type { SeoSetting } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const PAGE_OPTIONS = ['home', 'about', 'skills', 'projects', 'services', 'experience', 'testimonials', 'blog', 'contact'];

interface SeoFormData {
  page: string;
  metaTitle: string;
  metaDescription: string;
}

function SeoForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}: {
  initial?: SeoFormData;
  onSubmit: (data: SeoFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<SeoFormData>(initial || { page: '', metaTitle: '', metaDescription: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="seo-page">Page *</Label>
        {isEdit ? (
          <Input id="seo-page" value={form.page} disabled className="opacity-60" />
        ) : (
          <select
            id="seo-page"
            value={form.page}
            onChange={(e) => setForm({ ...form, page: e.target.value })}
            required
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a page...</option>
            {PAGE_OPTIONS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-title">Meta Title *</Label>
        <Input id="seo-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Page title for SEO" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-desc">Meta Description *</Label>
        <Textarea id="seo-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Page description for SEO (150-160 chars)" rows={3} required />
        <p className="text-xs text-muted-foreground">{form.metaDescription.length} / 160 characters</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save SEO Setting'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function SeoContent() {
  const { data: seoSettings, isLoading } = useGetSeoSettings();
  const { setSeoSetting, deleteSeoSetting } = useSeoMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SeoSetting | null>(null);

  const handleAdd = async (data: SeoFormData) => {
    try {
      await setSeoSetting.mutateAsync(data);
      setShowForm(false);
      toast.success('SEO setting saved!');
    } catch {
      toast.error('Failed to save SEO setting.');
    }
  };

  const handleUpdate = async (data: SeoFormData) => {
    try {
      await setSeoSetting.mutateAsync(data);
      setEditingItem(null);
      toast.success('SEO setting updated!');
    } catch {
      toast.error('Failed to update SEO setting.');
    }
  };

  const handleDelete = async (page: string) => {
    try {
      await deleteSeoSetting.mutateAsync(page);
      toast.success('SEO setting deleted.');
    } catch {
      toast.error('Failed to delete SEO setting.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">SEO Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure meta titles and descriptions per page.</p>
          </div>
          {!showForm && !editingItem && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add SEO Setting
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New SEO Setting</h2>
            <SeoForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={setSeoSetting.isPending} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : seoSettings && seoSettings.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No SEO settings configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {seoSettings?.map((item) => (
              <div key={item.page}>
                {editingItem?.page === item.page ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit SEO Setting</h2>
                    <SeoForm
                      initial={{ page: item.page, metaTitle: item.metaTitle, metaDescription: item.metaDescription }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                      isPending={setSeoSetting.isPending}
                      isEdit
                    />
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Search className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground border border-border">
                            /{item.page}
                          </span>
                        </div>
                        <p className="font-semibold text-sm mt-1 truncate">{item.metaTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.metaDescription}</p>
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
                            <AlertDialogTitle>Delete SEO Setting</AlertDialogTitle>
                            <AlertDialogDescription>Delete SEO setting for "/{item.page}"? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.page)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

export default function SeoManagement() {
  return <AdminGuard><SeoContent /></AdminGuard>;
}
