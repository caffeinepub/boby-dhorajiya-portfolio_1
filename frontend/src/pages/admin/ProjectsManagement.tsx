import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import {
  useGetProjects,
  useAddProject,
  useUpdateProject,
  useDeleteProject,
  useListCategories,
} from '../../hooks/useQueries';
import { type Project, ExternalBlob } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const ProjectCard = memo(({ project, onEdit, onDelete, isDeleting }: ProjectCardProps) => (
  <Card key={String(project.id)}>
    <CardHeader className="flex flex-row items-center justify-between py-3">
      <div>
        <CardTitle className="text-base">{project.title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {project.description}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" onClick={() => onEdit(project)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={() => onDelete(project.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
));

function ProjectsManagementContent() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { data: categories = [] } = useListCategories();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    categoryId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Reset page when search/filter changes
  const prevSearch = useRef(debouncedSearch);
  const prevCategory = useRef(categoryFilter);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch || prevCategory.current !== categoryFilter) {
      setPage(1);
      prevSearch.current = debouncedSearch;
      prevCategory.current = categoryFilter;
    }
  }, [debouncedSearch, categoryFilter]);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      (p.categoryId !== undefined && String(p.categoryId) === categoryFilter);
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = useCallback(() => {
    setEditingProject(null);
    setForm({ title: '', description: '', url: '', categoryId: '' });
    setImageFile(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      url: project.url,
      categoryId: project.categoryId !== undefined ? String(project.categoryId) : '',
    });
    setImageFile(null);
    setDialogOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Title is required.');
      return;
    }
    try {
      let image: ExternalBlob | null = null;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes);
      } else if (editingProject?.image) {
        image = editingProject.image;
      }

      const categoryId = form.categoryId ? BigInt(form.categoryId) : null;

      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          title: form.title,
          description: form.description,
          url: form.url,
          image,
          categoryId,
        });
        toast.success('Project updated.');
      } else {
        await addProject.mutateAsync({
          title: form.title,
          description: form.description,
          url: form.url,
          image,
          categoryId,
        });
        toast.success('Project created.');
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project.';
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Project deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project.';
      toast.error(msg);
    }
  }, [deleteProject]);

  const isSaving = addProject.isPending || updateProject.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={String(cat.id)} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginated.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No projects found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((project) => (
                <ProjectCard
                  key={String(project.id)}
                  project={project}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteProject.isPending}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={String(cat.id)} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
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

export default function ProjectsManagement() {
  return (
    <AdminGuard>
      <ProjectsManagementContent />
    </AdminGuard>
  );
}
