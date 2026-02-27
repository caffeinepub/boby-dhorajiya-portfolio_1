import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star, Quote } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetTestimonials, useTestimonialMutations } from '../../hooks/useQueries';
import type { Testimonial } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface TestimonialFormData {
  author: string;
  message: string;
}

function TestimonialForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: TestimonialFormData;
  onSubmit: (data: TestimonialFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<TestimonialFormData>(initial || { author: '', message: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="test-author">Author Name *</Label>
        <Input id="test-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Client name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="test-message">Message *</Label>
        <Textarea id="test-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Testimonial message..." rows={4} required />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Testimonial'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function TestimonialsContent() {
  const { data: testimonials, isLoading } = useGetTestimonials();
  const { addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonialMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const handleAdd = async (data: TestimonialFormData) => {
    try {
      await addTestimonial.mutateAsync(data);
      setShowForm(false);
      toast.success('Testimonial added!');
    } catch {
      toast.error('Failed to add testimonial.');
    }
  };

  const handleUpdate = async (data: TestimonialFormData) => {
    if (!editingItem) return;
    try {
      await updateTestimonial.mutateAsync({ id: editingItem.id, ...data });
      setEditingItem(null);
      toast.success('Testimonial updated!');
    } catch {
      toast.error('Failed to update testimonial.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTestimonial.mutateAsync(id);
      toast.success('Testimonial deleted.');
    } catch {
      toast.error('Failed to delete testimonial.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">Testimonials Management</h1>
          </div>
          {!showForm && !editingItem && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Testimonial
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New Testimonial</h2>
            <TestimonialForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addTestimonial.isPending} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : testimonials && testimonials.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No testimonials yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials?.map((item) => (
              <div key={item.id.toString()}>
                {editingItem?.id === item.id ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit Testimonial</h2>
                    <TestimonialForm
                      initial={{ author: item.author, message: item.message }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                      isPending={updateTestimonial.isPending}
                    />
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <Quote className="w-5 h-5 text-primary/40 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{item.author}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">"{item.message}"</p>
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
                            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this testimonial from "{item.author}"?</AlertDialogDescription>
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

export default function TestimonialsManagement() {
  return <AdminGuard><TestimonialsContent /></AdminGuard>;
}
