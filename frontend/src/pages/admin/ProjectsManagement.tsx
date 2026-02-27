import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink, FolderOpen, Search } from 'lucide-react';
import { useGetProjects, useAddProject, useUpdateProject, useDeleteProject, useGetCategories, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import { ExternalBlob } from '../../backend';
import type { Project } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ProjectFormData {
  title: string;
  description: string;
  url: string;
  imageFile: File | null;
  categoryId: string;
}

const emptyForm: ProjectFormData = { title: '', description: '', url: '', imageFile: null, categoryId: '' };

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function ProjectForm({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ProjectFormData>(initial || emptyForm);
  const { data: categories } = useGetCategories();

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="proj-title">Title *</Label>
        <Input id="proj-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proj-desc">Description *</Label>
        <Textarea id="proj-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" rows={3} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proj-url">URL</Label>
        <Input id="proj-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." type="url" />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Category</SelectItem>
            {(categories ?? []).map((cat) => (
              <SelectItem key={String(cat.id)} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="proj-image">Image</Label>
        <Input id="proj-image" type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ProjectsContent() {
  const { data: projects, isLoading } = useGetProjects();
  const { data: categories } = useGetCategories();
  const addProjectMutation = useAddProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (projects ?? []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleAdd = async (data: ProjectFormData) => {
    try {
      let image: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
      }
      const categoryId = data.categoryId && data.categoryId !== 'none' ? BigInt(data.categoryId) : null;
      await addProjectMutation.mutateAsync({ title: data.title, description: data.description, url: data.url, image, categoryId });
      setShowForm(false);
      setUploadProgress(0);
      toast.success('Project added successfully!');
    } catch {
      toast.error('Failed to add project.');
    }
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      let image: ExternalBlob | null = editingProject.image ?? null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
      }
      const categoryId = data.categoryId && data.categoryId !== 'none' ? BigInt(data.categoryId) : null;
      await updateProjectMutation.mutateAsync({ id: editingProject.id, title: data.title, description: data.description, url: data.url, image, categoryId });
      setEditingProject(null);
      setUploadProgress(0);
      toast.success('Project updated successfully!');
    } catch {
      toast.error('Failed to update project.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project.');
    }
  };

  const getCategoryName = (categoryId?: bigint) => {
    if (!categoryId) return null;
    return (categories ?? []).find((c) => BigInt(c.id) === categoryId)?.name ?? null;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">Manage your portfolio projects</p>
            </div>
            {!showForm && !editingProject && (
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">New Project</h2>
              <ProjectForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addProjectMutation.isPending} />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No projects yet. Add your first project!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((project) => (
                <div key={project.id.toString()}>
                  {editingProject?.id === project.id ? (
                    <div>
                      <h2 className="font-semibold mb-3">Edit Project</h2>
                      <ProjectForm
                        initial={{
                          title: project.title,
                          description: project.description,
                          url: project.url,
                          imageFile: null,
                          categoryId: project.categoryId ? String(project.categoryId) : '',
                        }}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingProject(null)}
                        isPending={updateProjectMutation.isPending}
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        {project.image && (
                          <img src={project.image.getDirectURL()} alt={project.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{project.title}</h3>
                          {project.categoryId && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-1 inline-block">
                              {getCategoryName(project.categoryId) ?? 'Category'}
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                              <ExternalLink className="w-3 h-3" /> {project.url}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditingProject(project)} aria-label="Edit project">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete project">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{project.title}"? This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

export default function ProjectsManagement() {
  return <AdminGuard><ProjectsContent /></AdminGuard>;
}
