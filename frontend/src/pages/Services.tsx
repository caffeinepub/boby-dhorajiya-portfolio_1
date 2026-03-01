import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetServices } from '../hooks/useQueries';
import { Wrench, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Services() {
  const { data: services, isLoading } = useGetServices();
  const [search, setSearch] = useState('');

  const filtered = services?.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <>
      <SEOHead page="services" defaultTitle="Services - Portfolio" defaultDescription="Professional development services I offer." />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Services</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">What I Offer</h1>
          <p className="text-lg text-muted-foreground">
            Professional development services tailored to your specific needs and goals.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services..."
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-10 w-10 rounded-lg mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(service => (
                <Card key={service.id.toString()} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {search ? 'No services match your search.' : 'No services available yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
