import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetSkills, useGetTestimonials } from '../hooks/useQueries';
import { SkillCategory } from '../backend';
import { Star } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  primary: 'Primary Skills',
  secondary: 'Secondary Skills',
  security: 'Security',
  additional: 'Additional Skills',
};

export default function About() {
  const { data: skills, isLoading: skillsLoading } = useGetSkills();
  const { data: testimonials, isLoading: testimonialsLoading } = useGetTestimonials();

  const skillsByCategory = skills?.reduce(
    (acc, skill) => {
      const cat = skill.category as string;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>
  ) ?? {};

  return (
    <>
      <SEOHead page="about" defaultTitle="About - Portfolio" defaultDescription="Learn more about my background, skills, and experience." />

      {/* Hero */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-6 max-w-3xl">
          <Badge variant="secondary">About Me</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Passionate Developer & Problem Solver
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm a full-stack developer with a passion for building elegant, performant, and user-friendly applications. With years of experience across various technologies, I bring ideas to life through clean code and thoughtful design.
          </p>
        </div>
      </section>

      {/* Skills by Category */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary">Expertise</Badge>
            <h2 className="text-3xl font-bold text-foreground">Skills & Technologies</h2>
          </div>
          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {categoryLabels[category] ?? category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categorySkills?.map(skill => (
                      <div key={skill.id.toString()} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="text-muted-foreground">{Number(skill.experience)}y exp</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, (Number(skill.experience) / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary">Testimonials</Badge>
            <h2 className="text-3xl font-bold text-foreground">What People Say</h2>
          </div>
          {testimonialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
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
          ) : (
            <p className="text-center text-muted-foreground">No testimonials yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
