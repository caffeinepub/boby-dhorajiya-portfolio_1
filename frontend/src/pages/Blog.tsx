import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Calendar, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useGetBlogs } from '../hooks/useQueries';

export default function Blog() {
  const { data: blogs, isLoading, error } = useGetBlogs();
  const navigate = useNavigate();

  return (
    <>
      <SEOHead page="blog" defaultTitle="Blog – Boby Dhorajiya" defaultDescription="Articles on Flutter, React Native, and mobile security." />

      <div className="pt-24 section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Insights</span>
            <h1 className="section-title font-display mt-2">
              The <span className="gradient-text">Blog</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              Thoughts on mobile development, security best practices, and the tech industry.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-muted-foreground">
              <p>Failed to load blog posts.</p>
            </div>
          )}

          {!isLoading && !error && blogs && blogs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          )}

          {blogs && blogs.length > 0 && (
            <div className="space-y-6">
              {blogs.map((post, idx) => (
                <button
                  key={post.id.toString()}
                  onClick={() => navigate({ to: '/blog/$slug', params: { slug: post.slug } })}
                  className="w-full text-left p-6 rounded-2xl border border-border bg-card card-hover group animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h2 className="font-display font-bold text-xl group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.metaDescription && (
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          {post.metaDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
