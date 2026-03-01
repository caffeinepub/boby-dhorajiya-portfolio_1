import { Link } from '@tanstack/react-router';
import { ArrowRight, Code2, Briefcase, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetProjects, useGetServices, useGetTestimonials } from '../hooks/useQueries';

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useGetProjects();
  const { data: services, isLoading: servicesLoading } = useGetServices();
  const { data: testimonials, isLoading: testimonialsLoading } = useGetTestimonials();

  const featuredProjects = projects?.filter(p => p.isActive).slice(0, 3) ?? [];
  const featuredServices = services?.slice(0, 3) ?? [];
  const featuredTestimonials = testimonials?.slice(0, 2) ?? [];

  return (
    <>
      <SEOHead page="home" defaultTitle="Portfolio - Home" defaultDescription="Professional portfolio showcasing projects, skills, and experience." />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <Badge variant="outline" className="text-sm px-4 py-1">
            Available for Work
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Building Digital
            <span className="text-primary block">Experiences</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Full-stack developer crafting elegant solutions to complex problems. Passionate about clean code, great UX, and cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/projects">
                View Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary">What I Do</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive development services tailored to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                  </Card>
                ))
              : featuredServices.map(service => (
                  <Card key={service.id.toString()} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/services">
                All Services <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary">My Work</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of projects I'm proud of.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                  </Card>
                ))
              : featuredProjects.map(project => (
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
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          View Project →
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/projects">
                All Projects <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      {(testimonialsLoading || featuredTestimonials.length > 0) && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="secondary">What People Say</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Testimonials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonialsLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))
                : featuredTestimonials.map(t => (
                    <Card key={t.id.toString()} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-muted-foreground italic">"{t.message}"</p>
                        <p className="font-semibold text-foreground">— {t.author}</p>
                      </CardContent>
                    </Card>
                  ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild className="gap-2">
                <Link to="/testimonials">
                  All Testimonials <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to Work Together?</h2>
          <p className="text-muted-foreground text-lg">
            Let's build something amazing. Reach out and let's discuss your project.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link to="/contact">
              Start a Conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
