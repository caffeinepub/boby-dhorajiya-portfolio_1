import React, { useState } from 'react';
import { Wrench, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useListServices } from '../hooks/useQueries';

const serviceCategories = [
  { id: 'all', label: 'All Services' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'web', label: 'Web' },
  { id: 'consulting', label: 'Consulting' },
];

export default function Services() {
  const { data: services, isLoading } = useListServices();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Wrench className="w-4 h-4" />
            What I Offer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">My Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional mobile app development services tailored to your needs.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {serviceCategories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-border rounded-xl p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : !services || services.length === 0 ? (
            <div className="text-center py-20">
              <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Services Added Yet</h3>
              <p className="text-muted-foreground">Services will appear here once added from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={String(service.id)}
                  className="border border-border rounded-xl p-6 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
