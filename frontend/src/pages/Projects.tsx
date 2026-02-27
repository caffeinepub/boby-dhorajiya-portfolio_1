import { useState } from 'react';
import { useGetProjects, useGetCategories } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Github } from 'lucide-react';

export default function Projects() {
  const { data: projects, isLoading: projectsLoading } = useGetProjects();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const [activeCategory, setActiveCategory] = useState<bigint | null>(null);

  const filtered = (projects ?? []).filter((p) => {
    if (activeCategory === null) return true;
    return p.categoryId !== undefined && p.categoryId !== null && BigInt(p.categoryId) === activeCategory;
  });

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">Projects</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of my work across mobile, web, and security domains.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            All
          </button>
          {categoriesLoading && (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-32 rounded-full" />)}
            </div>
          )}
          {(categories ?? []).map((cat) => (
            <button
              key={String(cat.id)}
              onClick={() => setActiveCategory(BigInt(cat.id))}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === BigInt(cat.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg">No projects found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const catName = (categories ?? []).find((c) => project.categoryId !== undefined && BigInt(c.id) === BigInt(project.categoryId!))?.name;
              return (
                <div
                  key={String(project.id)}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                >
                  {project.image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={project.image.getDirectURL()}
                        alt={`Screenshot of ${project.title} project`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Github size={40} className="text-primary/30" />
                    </div>
                  )}
                  <div className="p-5">
                    {catName && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 mb-3 inline-block">
                        {catName}
                      </span>
                    )}
                    <h3 className="font-bold text-foreground text-lg mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} project`}
                        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                      >
                        <ExternalLink size={14} /> View Project
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
