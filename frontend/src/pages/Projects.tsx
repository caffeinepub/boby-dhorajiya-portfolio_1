import React, { useState, useMemo } from 'react';
import { ExternalLink, FolderOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProjects, useGetCategories } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

function ProjectsLoader() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-8 w-32 rounded-full mx-auto mb-6" />
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </section>

      {/* Tabs skeleton */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading projects...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Projects() {
  const {
    data: projects,
    isLoading: projectsLoading,
    isSuccess: projectsSuccess,
  } = useGetProjects();

  const {
    data: categories,
    isLoading: categoriesLoading,
    isSuccess: categoriesSuccess,
  } = useGetCategories();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const isLoading = projectsLoading || categoriesLoading;
  const isReady = projectsSuccess && categoriesSuccess;

  // Sort categories by order (backend already sorts, but ensure client-side too)
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => Number(a.order) - Number(b.order));
  }, [categories]);

  // Filter only active projects and sort by order (backend already does this, but safeguard)
  const activeProjects = useMemo(() => {
    if (!projects) return [];
    return [...projects]
      .filter((p) => p.isActive)
      .sort((a, b) => Number(a.order) - Number(b.order));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return activeProjects;
    const cat = sortedCategories.find((c) => c.slug === activeCategory);
    if (!cat) return activeProjects;
    return activeProjects.filter(
      (p) => p.categoryId !== undefined && p.categoryId !== null && p.categoryId === cat.id
    );
  }, [activeProjects, sortedCategories, activeCategory]);

  const tabs = useMemo(() => {
    const all = { id: 'all', label: 'All Projects' };
    const cats = sortedCategories.map((c) => ({ id: c.slug, label: c.name }));
    return [all, ...cats];
  }, [sortedCategories]);

  // Show full-page loader while data is being fetched
  if (isLoading || !isReady) {
    return <ProjectsLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FolderOpen className="w-4 h-4" />
            Portfolio
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">My Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A showcase of my work as a Mobile App Developer — from concept to deployment.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeCategory === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                {activeCategory !== 'all' ? 'No projects in this category yet.' : 'No projects added yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const imageUrl =
                  project.image instanceof ExternalBlob
                    ? project.image.getDirectURL()
                    : null;
                const category = sortedCategories.find((c) => c.id === project.categoryId);

                return (
                  <article
                    key={String(project.id)}
                    className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {category && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                        >
                          View Project
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
