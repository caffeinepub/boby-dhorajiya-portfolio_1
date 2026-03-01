import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import SEOHead from '../components/SEOHead';
import { useGetBlogPosts } from '../hooks/useQueries';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Blog() {
  const { data: posts, isLoading } = useGetBlogPosts();
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <SEOHead page="blog" defaultTitle="Blog - Portfolio" defaultDescription="Articles, tutorials, and thoughts on software development." />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Articles & Insights</h1>
          <p className="text-lg text-muted-foreground">
            Thoughts, tutorials, and insights on software development and technology.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Card
                  key={post.id.toString()}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate({ to: '/blog/$slug', params: { slug: post.slug } })}
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.metaDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.timestamp)}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                      Read <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
