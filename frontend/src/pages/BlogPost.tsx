import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useGetBlogBySlug } from '../hooks/useQueries';

export default function BlogPost() {
  const { slug } = useParams({ from: '/blog/$slug' });
  const { data: post, isLoading, error } = useGetBlogBySlug(slug);

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-24 section-padding">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Article header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight">{post.title}</h1>
          {post.metaDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">{post.metaDescription}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Content */}
        <article className="prose-portfolio animate-slide-up">
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</div>
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/blog" className="btn-outline inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
