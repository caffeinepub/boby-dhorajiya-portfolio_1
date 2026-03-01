import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetProjects, useGetProjectCategories } from '../hooks/useQueries';
import { Code2, ExternalLink } from 'lucide-react';

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: projects, isLoading: projectsLoading } = useGetProjects();
  const { data: categories, isLoading: categoriesLoading } = useGetProjectCategories();

  const isLoading = projectsLoading || categoriesLoading;

  const activeProjects = projects?.filter(p => p.isActive) ?? [];
  const sortedProjects = [...activeProjects].sort((a, b) => Number(a.order) - Number(b.order));
  const sortedCategories = [...(categories ?? [])].sort((a, b) => Number(a.order) - Number(b.order));

  const filteredProjects = selectedCategory === 'all'
    ? sortedProjects
    : sortedProjects.filter(p => {
        if (!p.categoryId) return false;
        const cat = categories?.find(c => c.id === p.categoryId);
        return cat?.slug === selectedCategory;
      });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="flex gap-2 justify-center mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead page="projects" defaultTitle="Projects - Portfolio" defaultDescription="Browse my portfolio of projects across various technologies." />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Portfolio</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">My Projects</h1>
          <p className="text-lg text-muted-foreground">
            A collection of projects I've built, from web apps to open-source tools.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {sortedCategories.map(cat => (
              <Button
                key={cat.id.toString()}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id.toString()} className="overflow-hidden hover:shadow-md transition-shadow group">
                  {project.image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={project.image.getDirectURL()}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <Code2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        View Project <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
