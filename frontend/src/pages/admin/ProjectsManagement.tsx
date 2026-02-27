import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, ExternalLink, FolderOpen } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetProjects, useProjectMutations } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import type { Project } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface ProjectFormData {
  title: string;
  description: string;
  url: string;
  imageFile: File | null;
}

const emptyForm: ProjectFormData = { title: '', description: '', url: '', imageFile: null };

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ProjectFormData>(initial || emptyForm);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4 p-6 rounded-2xl border border-border bg-card"
    >
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
        <Label htmlFor="proj-image">Image</Label>
        <Input
          id="proj-image"
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Project'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function ProjectsContent() {
  const { data: projects, isLoading } = useGetProjects();
  const { addProject, updateProject, deleteProject } = useProjectMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAdd = async (data: ProjectFormData) => {
    try {
      let image: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
      }
      await addProject.mutateAsync({ title: data.title, description: data.description, url: data.url, image });
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
      let image: ExternalBlob | null = editingProject.image || null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
      }
      await updateProject.mutateAsync({ id: editingProject.id, title: data.title, description: data.description, url: data.url, image });
      setEditingProject(null);
      setUploadProgress(0);
      toast.success('Project updated successfully!');
    } catch {
      toast.error('Failed to update project.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
            <h1 className="font-display font-bold text-2xl">Projects Management</h1>
          </div>
          {!showForm && !editingProject && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">New Project</h2>
            <ProjectForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addProject.isPending} />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : projects && projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects yet. Add your first project!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects?.map((project) => (
              <div key={project.id.toString()}>
                {editingProject?.id === project.id ? (
                  <div>
                    <h2 className="font-semibold mb-3">Edit Project</h2>
                    <ProjectForm
                      initial={{ title: project.title, description: project.description, url: project.url, imageFile: null }}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingProject(null)}
                      isPending={updateProject.isPending}
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
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> {project.url}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEditingProject(project)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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
      </div>
    </div>
  );
}

export default function ProjectsManagement() {
  return <AdminGuard><ProjectsContent /></AdminGuard>;
}
