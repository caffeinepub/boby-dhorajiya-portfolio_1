import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetExperiences } from '../hooks/useQueries';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

export default function Experience() {
  const { data: experiences, isLoading } = useGetExperiences();

  return (
    <>
      <SEOHead page="experience" defaultTitle="Experience - Portfolio" defaultDescription="My professional work experience and career history." />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Career</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Work Experience</h1>
          <p className="text-lg text-muted-foreground">
            A timeline of my professional journey and the companies I've worked with.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : experiences && experiences.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <div key={exp.id.toString()} className="relative md:pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-primary border-2 border-background hidden md:block" />
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-primary" />
                              {exp.title}
                            </CardTitle>
                            <p className="text-primary font-medium mt-1">{exp.company}</p>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Calendar className="h-3 w-3" />
                            {exp.period}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{exp.description}</p>
                        {exp.responsibilities.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Key Responsibilities:</h4>
                            <ul className="space-y-1">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No experience entries yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
