import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Smartphone, Code2, Globe, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetProjects, useGetServices, useGetTestimonials } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalBlob } from '../backend';

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useGetProjects();
  const { data: services, isLoading: servicesLoading } = useGetServices();
  const { data: testimonials } = useGetTestimonials();

  const featuredProjects = projects?.slice(0, 3) ?? [];
  const featuredServices = services?.slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Mobile App Developer
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Building Apps That{' '}
              <span className="text-primary">Make a Difference</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              I craft high-quality mobile applications for iOS and Android that deliver 
              exceptional user experiences and drive real business results.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/projects">
                  View My Work
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">What I Do</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Specialized services to help you build and grow your digital presence.
            </p>
          </div>
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <div
                  key={String(service.id)}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Smartphone, title: 'Mobile App Development', desc: 'Native and cross-platform apps for iOS and Android.' },
                { icon: Code2, title: 'Custom Software', desc: 'Tailored software solutions for your unique business needs.' },
                { icon: Globe, title: 'Web Development', desc: 'Modern, responsive web applications built with the latest tech.' },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/services">
                View All Services
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Featured Projects</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A selection of my recent work across mobile and web platforms.
            </p>
          </div>
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((project) => {
                const imageUrl = project.image instanceof ExternalBlob
                  ? project.image.getDirectURL()
                  : null;
                return (
                  <article
                    key={String(project.id)}
                    className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-muted overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Globe className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/projects">
                View All Projects
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-3">Client Testimonials</h2>
              <p className="text-muted-foreground">What my clients say about working with me.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map((t) => (
                <div key={String(t.id)} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 italic">"{t.message}"</p>
                  <p className="font-semibold text-foreground text-sm">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Build Something Great?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's work together to bring your app idea to life. I'm available for freelance projects.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/contact">
              Start a Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
