import { useParams, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '../components/SEOHead';
import { useGetBlogPosts } from '../hooks/useQueries';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams({ strict: false });
  const { data: posts, isLoading } = useGetBlogPosts();

  const post = posts?.find(p => p.slug === slug);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        page={`blog-${post.slug}`}
        defaultTitle={post.metaTitle || post.title}
        defaultDescription={post.metaDescription}
      />

      <article className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="gap-2 mb-6 -ml-2">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
          <Badge variant="secondary" className="mb-4">Article</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.timestamp)}</span>
          </div>
        </div>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
