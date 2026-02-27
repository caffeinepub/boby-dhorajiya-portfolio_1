import React from 'react';
import { ExternalLink, Smartphone, Shield, Code2, Loader2, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useGetProjects } from '../hooks/useQueries';
import type { Project } from '../backend';

const placeholderProjects = [
  {
    id: 'p1',
    title: 'SecureBank Mobile',
    platform: 'iOS & Android (Flutter)',
    techUsed: 'Flutter, Dart, Firebase, JWT',
    securityImplemented: 'Biometric Auth, AES-256 Encryption, Certificate Pinning',
    description: 'A full-featured mobile banking application with enterprise-grade security, real-time transactions, and seamless UX.',
    role: 'Lead Mobile Developer',
    url: '',
  },
  {
    id: 'p2',
    title: 'HealthTrack Pro',
    platform: 'iOS & Android (React Native)',
    techUsed: 'React Native, TypeScript, REST APIs',
    securityImplemented: 'HIPAA Compliance, Secure Storage, OAuth 2.0',
    description: 'A health monitoring app with secure patient data management, wearable device integration, and telemedicine features.',
    role: 'Full-Stack Mobile Developer',
    url: '',
  },
  {
    id: 'p3',
    title: 'E-Commerce Suite',
    platform: 'iOS & Android (Flutter)',
    techUsed: 'Flutter, Dart, Stripe, Firebase',
    securityImplemented: 'PCI-DSS Compliance, Tokenized Payments, SSL Pinning',
    description: 'A comprehensive e-commerce platform with secure payment processing, inventory management, and analytics dashboard.',
    role: 'Mobile App Developer',
    url: '',
  },
];

interface ProjectCardProps {
  title: string;
  platform?: string;
  techUsed?: string;
  securityImplemented?: string;
  description: string;
  role?: string;
  url?: string;
  image?: string;
}

function ProjectCard({ title, platform, techUsed, securityImplemented, description, role, url, image }: ProjectCardProps) {
  return (
    <div className="group p-6 rounded-2xl border border-border bg-card card-hover overflow-hidden">
      {/* Image */}
      {image && (
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-muted">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      {!image && (
        <div className="w-full h-40 rounded-xl mb-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
          <Smartphone className="w-12 h-12 text-primary/40" />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {platform && (
          <div className="flex items-center gap-2 text-xs">
            <Smartphone className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">{platform}</span>
          </div>
        )}

        {techUsed && (
          <div className="flex items-start gap-2 text-xs">
            <Code2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{techUsed}</span>
          </div>
        )}

        {securityImplemented && (
          <div className="flex items-start gap-2 text-xs">
            <Shield className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{securityImplemented}</span>
          </div>
        )}

        {role && (
          <div className="pt-2 border-t border-border">
            <span className="text-xs font-medium text-primary">{role}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const { data: projects, isLoading, error } = useGetProjects();

  const hasBackendProjects = projects && projects.length > 0;

  return (
    <>
      <SEOHead page="projects" defaultTitle="Projects – Boby Dhorajiya" defaultDescription="Mobile app projects built with Flutter and React Native." />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Portfolio</span>
            <h1 className="section-title font-display mt-2">
              Featured <span className="gradient-text">Projects</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              A selection of mobile applications built with security and performance in mind.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive mb-8">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Failed to load projects. Showing sample projects.</p>
            </div>
          )}

          {/* Backend projects */}
          {hasBackendProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.map((project: Project, idx: number) => (
                <div key={project.id.toString()} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    url={project.url}
                    image={project.image ? project.image.getDirectURL() : undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Placeholder projects */}
          {!hasBackendProjects && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {placeholderProjects.map((project, idx) => (
                  <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <ProjectCard {...project} />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-8">
                * Sample projects shown. Add real projects via the admin panel.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
