import React from 'react';
import { Briefcase, Calendar, Building2, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetExperiences } from '../hooks/useQueries';

export default function Experience() {
  const { data: experiences, isLoading } = useGetExperiences();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Work History
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Professional Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A journey through my career as a Mobile App Developer, building impactful solutions.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="w-0.5 h-32 mt-2" />
                  </div>
                  <div className="flex-1 pb-8">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !experiences || experiences.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Experience Added Yet</h3>
              <p className="text-muted-foreground">Work experience entries will appear here once added.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-0">
                {experiences.map((exp, index) => (
                  <div key={String(exp.id)} className="relative flex gap-6 pb-12 last:pb-0">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Briefcase className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{exp.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="text-primary font-medium">{exp.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.period}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{exp.description}</p>

                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                            Key Responsibilities
                          </h4>
                          <ul className="space-y-1.5">
                            {exp.responsibilities.map((resp, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
