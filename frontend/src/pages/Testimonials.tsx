import React from 'react';
import { Quote, Star, Loader2, MessageSquare } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useGetTestimonials } from '../hooks/useQueries';

export default function Testimonials() {
  const { data: testimonials, isLoading, error } = useGetTestimonials();

  return (
    <>
      <SEOHead page="testimonials" defaultTitle="Testimonials – Boby Dhorajiya" defaultDescription="What clients say about working with Boby Dhorajiya." />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Client Reviews</span>
            <h1 className="section-title font-display mt-2">
              What Clients <span className="gradient-text">Say</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              Feedback from clients and collaborators I've had the pleasure of working with.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-muted-foreground">
              <p>Failed to load testimonials.</p>
            </div>
          )}

          {!isLoading && !error && testimonials && testimonials.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No testimonials yet. Check back soon!</p>
            </div>
          )}

          {testimonials && testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={testimonial.id.toString()}
                  className="p-6 rounded-2xl border border-border bg-card card-hover animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-chart-4 fill-chart-4" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/30 mb-3" />
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                    "{testimonial.message}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {testimonial.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
