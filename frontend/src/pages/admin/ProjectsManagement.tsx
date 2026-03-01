import React, { useState, useRef, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, GripVertical, Loader2, ImageIcon } from 'lucide-react';
import {
  useGetAllProjectsAdmin,
  useGetProjectCategories,
  useAddProject,
  useUpdateProject,
  useDeleteProject,
  useToggleProjectActive,
  useReorderProjects,
} from '../../hooks/useQueries';
import { ExternalBlob, type Project, type ProjectCategory } from '../../backend';
import { toast } from 'sonner';

interface ProjectFormData {
  title: string;
  description: string;
  url: string;
  categoryId: string;
  isActive: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  existingImage: ExternalBlob | null;
}

const defaultForm: ProjectFormData = {
  title: '',
  description: '',
  url: '',
  categoryId: 'none',
  isActive: true,
  imageFile: null,
  imagePreview: null,
  existingImage: null,
};

export default function ProjectsManagement() {
  return (
    <AdminGuard>
      <ProjectsManagementInner />
    </AdminGuard>
  );
}

function ProjectsManagementInner() {
  const { data: projects = [], isLoading: projectsLoading } = useGetAllProjectsAdmin();
  const { data: categories = [] } = useGetProjectCategories();

  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const toggleActive = useToggleProjectActive();
  const reorderProjects = useReorderProjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>(defaultForm);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Drag-and-drop state
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [draggedId, setDraggedId] = useState<bigint | null>(null);
  const [dragOverId, setDragOverId] = useState<bigint | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // Sync localProjects with fetched projects (sorted by order)
  const sortedProjects = React.useMemo(
    () => [...projects].sort((a, b) => Number(a.order) - Number(b.order)),
    [projects],
  );

  // Use localProjects for display if we have them, otherwise use sorted
  const displayProjects = localProjects.length > 0 ? localProjects : sortedProjects;

  // Keep localProjects in sync when server data changes (but not during drag)
  React.useEffect(() => {
    if (draggedId === null) {
      setLocalProjects([...sortedProjects]);
    }
  }, [sortedProjects, draggedId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditingProject(null);
    setForm(defaultForm);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      url: project.url,
      categoryId: project.categoryId ? project.categoryId.toString() : 'none',
      isActive: project.isActive,
      imageFile: null,
      imagePreview: project.image ? project.image.getDirectURL() : null,
      existingImage: project.image ?? null,
    });
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    let imageBlob: ExternalBlob | null = form.existingImage;

    if (form.imageFile) {
      const bytes = new Uint8Array(await form.imageFile.arrayBuffer());
      imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));
    }

    const categoryId = form.categoryId && form.categoryId !== 'none' ? BigInt(form.categoryId) : null;

    if (editingProject) {
      await updateProject.mutateAsync({
        id: editingProject.id,
        title: form.title,
        description: form.description,
        url: form.url,
        image: imageBlob,
        categoryId,
        order: editingProject.order,
        isActive: form.isActive,
      });
    } else {
      const maxOrder = displayProjects.length > 0 ? Math.max(...displayProjects.map((p) => Number(p.order))) + 1 : 0;
      await addProject.mutateAsync({
        title: form.title,
        description: form.description,
        url: form.url,
        image: imageBlob,
        categoryId,
        order: BigInt(maxOrder),
        isActive: form.isActive,
      });
    }

    setIsFormOpen(false);
    setForm(defaultForm);
    setUploadProgress(0);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleActive = async (project: Project) => {
    await toggleActive.mutateAsync(project);
  };

  // ── Drag-and-drop handlers ────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, project: Project) => {
      setDraggedId(project.id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', project.id.toString());
      dragNodeRef.current = e.currentTarget;
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, project: Project) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedId === null || draggedId === project.id) return;
      setDragOverId(project.id);

      setLocalProjects((prev) => {
        const draggedIdx = prev.findIndex((p) => p.id === draggedId);
        const targetIdx = prev.findIndex((p) => p.id === project.id);
        if (draggedIdx === -1 || targetIdx === -1) return prev;
        const next = [...prev];
        const [removed] = next.splice(draggedIdx, 1);
        next.splice(targetIdx, 0, removed);
        return next;
      });
    },
    [draggedId],
  );

  const handleDragEnd = useCallback(async () => {
    setDraggedId(null);
    setDragOverId(null);

    // Save new order to backend
    if (localProjects.length > 0) {
      const orderedIds = localProjects.map((p) => p.id);
      await reorderProjects.mutateAsync(orderedIds);
    }
  }, [localProjects, reorderProjects]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const getCategoryName = (categoryId?: bigint) => {
    if (!categoryId) return null;
    const cat = categories.find((c: ProjectCategory) => c.id === categoryId);
    return cat?.name ?? null;
  };

  const isMutating =
    addProject.isPending || updateProject.isPending || deleteProject.isPending;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage your portfolio projects. Drag rows to reorder.
              </p>
            </div>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>

          {/* Projects List */}
          {projectsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No projects yet.</p>
              <p className="text-sm mt-1">Click "Add Project" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayProjects.map((project) => {
                const isDragging = draggedId === project.id;
                const isDragOver = dragOverId === project.id;
                const categoryName = getCategoryName(project.categoryId);

                return (
                  <div
                    key={project.id.toString()}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragOver={(e) => handleDragOver(e, project)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={handleDragLeave}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border bg-card transition-all
                      ${isDragging ? 'opacity-40 scale-95 border-primary' : ''}
                      ${isDragOver && !isDragging ? 'border-primary bg-primary/5 shadow-md' : ''}
                      ${!project.isActive ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Project Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                      {project.image ? (
                        <img
                          src={project.image.getDirectURL()}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">{project.title}</span>
                        {/* Status Badge */}
                        <Badge
                          variant={project.isActive ? 'default' : 'secondary'}
                          className={`text-xs flex-shrink-0 ${
                            project.isActive
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {project.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {categoryName && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {categoryName}
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {project.description}
                        </p>
                      )}
                      {project.url && (
                        <p className="text-xs text-primary truncate">{project.url}</p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Active Toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Switch
                              checked={project.isActive}
                              onCheckedChange={() => handleToggleActive(project)}
                              disabled={toggleActive.isPending}
                              aria-label={project.isActive ? 'Deactivate project' : 'Activate project'}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {project.isActive ? 'Deactivate project' : 'Activate project'}
                        </TooltipContent>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(project)}
                            disabled={isMutating}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit project</TooltipContent>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(project)}
                            disabled={isMutating}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete project</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reorder saving indicator */}
          {reorderProjects.isPending && (
            <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border rounded-lg px-4 py-2 shadow-lg text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving order…
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Project description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => setForm((f) => ({ ...f, categoryId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat: ProjectCategory) => (
                    <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Image</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Click to upload image</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active (visible on public site)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProject.isPending || updateProject.isPending}>
                {(addProject.isPending || updateProject.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingProject ? 'Save Changes' : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
