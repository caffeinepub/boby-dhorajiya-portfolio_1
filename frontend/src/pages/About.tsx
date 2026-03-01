import React from 'react';
import { User, Code2, Smartphone, Globe, Award, Heart } from 'lucide-react';
import { useGetSkills, useGetTestimonials } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillCategory } from '../backend';

const skillCategoryLabels: Record<string, string> = {
  primary: 'Primary Skills',
  secondary: 'Secondary Skills',
  security: 'Security',
  additional: 'Additional Skills',
};

export default function About() {
  const { data: skills, isLoading: skillsLoading } = useGetSkills();
  const { data: testimonials, isLoading: testimonialsLoading } = useGetTestimonials();

  const groupedSkills = skills?.reduce(
    (acc, skill) => {
      const cat = skill.category as string;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/image.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <User className="w-20 h-20 text-primary/40 absolute" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <User className="w-4 h-4" />
                About Me
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                Mobile App Developer
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Passionate mobile app developer with expertise in building high-quality, 
                user-centric applications for iOS and Android platforms. I specialize in 
                creating seamless digital experiences that solve real-world problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Mobile Development</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Specializing in cross-platform and native mobile app development using 
                Flutter, React Native, Swift, and Kotlin. Building apps that users love.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Web Development</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Full-stack web development with modern frameworks like React, Next.js, 
                and Node.js. Creating responsive, performant web applications.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Clean Code</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Writing maintainable, scalable, and well-documented code following 
                industry best practices and design patterns.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">User-Centric</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Focused on delivering exceptional user experiences through thoughtful 
                UI/UX design and performance optimization.
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Skills & Expertise
            </h2>
            {skillsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-5 w-32 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-8 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !skills || skills.length === 0 ? (
              <p className="text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSkills ?? {}).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      {skillCategoryLabels[category] ?? category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills?.map((skill) => (
                        <div
                          key={String(skill.id)}
                          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          <span>{skill.name}</span>
                          {Number(skill.experience) > 0 && (
                            <span className="text-xs opacity-70">{Number(skill.experience)}y</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Testimonials */}
          {!testimonialsLoading && testimonials && testimonials.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">What Clients Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div key={String(t.id)} className="bg-card border border-border rounded-xl p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3 italic">
                      "{t.message}"
                    </p>
                    <p className="font-semibold text-foreground text-sm">— {t.author}</p>
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
