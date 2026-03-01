import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetTestimonials } from '../hooks/useQueries';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const { data: testimonials, isLoading } = useGetTestimonials();

  return (
    <>
      <SEOHead page="testimonials" defaultTitle="Testimonials - Portfolio" defaultDescription="What clients and colleagues say about working with me." />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Testimonials</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">What People Say</h1>
          <p className="text-lg text-muted-foreground">
            Feedback from clients and colleagues I've had the pleasure of working with.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
                    <p className="text-muted-foreground italic leading-relaxed">"{t.message}"</p>
                    <p className="font-semibold text-foreground">— {t.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No testimonials yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
