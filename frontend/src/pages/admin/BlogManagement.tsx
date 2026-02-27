import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, BookOpen, Calendar } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetBlogs, useBlogMutations } from '../../hooks/useQueries';
import type { BlogPost } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface BlogFormData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

const emptyForm: BlogFormData = { title: '', slug: '', metaTitle: '', metaDescription: '', content: '' };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function BlogForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: BlogFormData;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<BlogFormData>(initial || emptyForm);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: initial ? prev.slug : slugify(title) }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title *</Label>
          <Input id="blog-title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-slug">Slug *</Label>
          <Input id="blog-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="post-slug" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-meta-title">Meta Title</Label>
        <Input id="blog-meta-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-meta-desc">Meta Description</Label>
        <Input id="blog-meta-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-content">Content *</Label>
        <Textarea id="blog-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your blog post content..." rows={8} required />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Post'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function BlogContent() {
  const { data: blogs, isLoading } = useGetBlogs();
  const { addBlog, updateBlog, deleteBlog } = useBlogMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const handleAdd = async (data: BlogFormData) => {
    try {
      await addBlog.mutateAsync(data);
      setShowForm(false);
      toast.success('Blog post added!');
    } catch {
      toast.error('Failed to add blog post.');
    }
  };

  const handleUpdate = async (data: BlogFormData) => {
    if (!editingBlog) return;
    try {
      await updateBlog.mutateAsync({ id: editingBlog.id, ...data });
      setEditingBlog(null);
      toast.success('Blog post updated!');
    } catch {
      toast.error('Failed to update blog post.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteBlog.mutateAsync(id);
      toast.success('Blog post deleted.');
    } catch {
      toast.error('Failed to delete blog post.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">Blog Management</h1>
          </div>
          {!showForm && !editingBlog && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Post
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New Blog Post</h2>
            <BlogForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addBlog.isPending} />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : blogs && blogs.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No blog posts yet. Write your first post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs?.map((blog) => (
              <div key={blog.id.toString()}>
                {editingBlog?.id === blog.id ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit Post</h2>
                    <BlogForm
                      initial={{ title: blog.title, slug: blog.slug, metaTitle: blog.metaTitle, metaDescription: blog.metaDescription, content: blog.content }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingBlog(null)}
                      isPending={updateBlog.isPending}
                    />
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{blog.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">/{blog.slug}</p>
                      {blog.metaDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{blog.metaDescription}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(Number(blog.timestamp) / 1_000_000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEditingBlog(blog)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete "{blog.title}"? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

export default function BlogManagement() {
  return <AdminGuard><BlogContent /></AdminGuard>;
}
