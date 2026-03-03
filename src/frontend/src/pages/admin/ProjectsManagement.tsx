import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ExternalLink,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Project } from "../../backend";
import {
  useAddProject,
  useDeleteProject,
  useGetAllProjectsAdmin,
  useGetProjectCategories,
  useReorderProjects,
  useToggleProjectActive,
  useUpdateProject,
} from "../../hooks/useQueries";

interface ProjectFormData {
  title: string;
  description: string;
  url: string;
  categoryId: string;
  isActive: boolean;
  imageFile: File | null;
  existingImage: ExternalBlob | null;
}

const emptyForm: ProjectFormData = {
  title: "",
  description: "",
  url: "",
  categoryId: "",
  isActive: true,
  imageFile: null,
  existingImage: null,
};

export default function ProjectsManagement() {
  const { data: projects, isLoading: projectsLoading } =
    useGetAllProjectsAdmin();
  const { data: categories } = useGetProjectCategories();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const reorderProjects = useReorderProjects();
  const toggleActive = useToggleProjectActive();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [localProjects, setLocalProjects] = useState<Project[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayProjects = (localProjects ?? projects ?? [])
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => Number(a.order) - Number(b.order));

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      url: project.url,
      categoryId: project.categoryId ? project.categoryId.toString() : "",
      isActive: project.isActive,
      imageFile: null,
      existingImage: project.image ?? null,
    });
    setDialogOpen(true);
  };

  const openDelete = (id: bigint) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageBlob: ExternalBlob | null = form.existingImage;

    if (form.imageFile) {
      const bytes = new Uint8Array(await form.imageFile.arrayBuffer());
      imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
    }

    const categoryId = form.categoryId ? BigInt(form.categoryId) : null;
    const order = editingProject
      ? editingProject.order
      : BigInt(projects?.length ?? 0);

    if (editingProject) {
      await updateProject.mutateAsync({
        id: editingProject.id,
        title: form.title,
        description: form.description,
        url: form.url,
        image: imageBlob,
        categoryId,
        order,
        isActive: form.isActive,
      });
      toast.success("Project updated!");
    } else {
      await addProject.mutateAsync({
        title: form.title,
        description: form.description,
        url: form.url,
        image: imageBlob,
        categoryId,
        order,
        isActive: form.isActive,
      });
      toast.success("Project added!");
    }

    setLocalProjects(null);
    setUploadProgress(0);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteProject.mutateAsync(deletingId);
    setLocalProjects(null);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    toast.success("Project deleted!");
  };

  const handleToggleActive = async (project: Project) => {
    await toggleActive.mutateAsync(project);
    toast.success(
      project.isActive ? "Project deactivated" : "Project activated",
    );
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const current =
      localProjects ??
      [...(projects ?? [])].sort((a, b) => Number(a.order) - Number(b.order));
    const reordered = [...current];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setLocalProjects(reordered);
    setDragIndex(index);
  };

  const handleDrop = async () => {
    if (!localProjects) return;
    const orderedIds = localProjects.map((p) => p.id);
    await reorderProjects.mutateAsync(orderedIds);
    setDragIndex(null);
  };

  const isMutating = addProject.isPending || updateProject.isPending;

  return (
    <>
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Projects Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your portfolio projects. Drag to reorder.
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Projects List */}
          {projectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-xl p-4">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {search
                ? "No projects match your search."
                : "No projects yet. Add your first one!"}
            </div>
          ) : (
            <div className="space-y-3">
              {displayProjects.map((project, index) => {
                const category = categories?.find(
                  (c) => c.id === project.categoryId,
                );
                return (
                  <div
                    key={String(project.id)}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    className="border border-border rounded-xl p-4 bg-card flex items-center gap-4 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                    {project.image && (
                      <img
                        src={project.image.getDirectURL()}
                        alt={project.title}
                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <Badge
                          variant={project.isActive ? "default" : "secondary"}
                        >
                          {project.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {category && (
                          <Badge variant="outline">{category.name}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs hover:underline flex items-center gap-1 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" /> {project.url}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={project.isActive}
                        onCheckedChange={() => handleToggleActive(project)}
                        disabled={toggleActive.isPending}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(project)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update the project details."
                : "Add a new project to your portfolio."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="proj-title">Title *</Label>
              <Input
                id="proj-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Project title"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea
                id="proj-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Project description"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="proj-url">URL</Label>
              <Input
                id="proj-url"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, categoryId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem
                      key={cat.id.toString()}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="proj-image">Image</Label>
              <Input
                id="proj-image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
              />
              {form.existingImage && !form.imageFile && (
                <p className="text-xs text-muted-foreground">
                  Current image will be kept unless you select a new one.
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="proj-active"
                checked={form.isActive}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, isActive: val }))
                }
              />
              <Label htmlFor="proj-active">Active (visible on portfolio)</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : editingProject ? (
                  "Update"
                ) : (
                  "Add"
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
