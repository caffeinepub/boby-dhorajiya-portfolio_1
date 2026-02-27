import React from 'react';
import { Smartphone, Shield, Code2, Flame, Globe, Lock, Zap, Loader2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useGetServices } from '../hooks/useQueries';
import type { Service } from '../backend';

const staticServices = [
  {
    icon: Smartphone,
    title: 'Flutter App Development',
    description: 'Build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase using Flutter and Dart.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    icon: Code2,
    title: 'React Native Development',
    description: 'Create cross-platform mobile apps with React Native, leveraging JavaScript expertise for iOS and Android development.',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/20',
  },
  {
    icon: Shield,
    title: 'Secure Mobile App Architecture',
    description: 'Design and implement security-first mobile architectures with threat modeling, secure data flows, and defense-in-depth strategies.',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/20',
  },
  {
    icon: Zap,
    title: 'API Integration',
    description: 'Seamlessly integrate RESTful APIs, GraphQL, and third-party services with secure authentication and efficient data handling.',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/20',
  },
  {
    icon: Flame,
    title: 'Firebase Integration',
    description: 'Implement Firebase services including Authentication, Firestore, Cloud Functions, and Analytics for scalable mobile backends.',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    borderColor: 'border-chart-5/20',
  },
  {
    icon: Lock,
    title: 'Mobile App Security Consulting',
    description: 'Comprehensive security audits, penetration testing guidance, and implementation of OWASP Mobile Top 10 mitigations.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    icon: Globe,
    title: 'Web Development Support',
    description: 'Extend your mobile app with responsive web interfaces using React, ensuring consistent UX across all platforms.',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/20',
  },
];

export default function Services() {
  const { data: backendServices, isLoading } = useGetServices();

  const displayServices = backendServices && backendServices.length > 0 ? null : staticServices;

  return (
    <>
      <SEOHead page="services" defaultTitle="Services – Boby Dhorajiya" defaultDescription="Mobile app development services including Flutter, React Native, and security consulting." />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">What I Offer</span>
            <h1 className="section-title font-display mt-2">
              My <span className="gradient-text">Services</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              End-to-end mobile development services with a focus on security, performance, and scalability.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Backend services */}
          {backendServices && backendServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {backendServices.map((service: Service, idx: number) => (
                <div
                  key={service.id.toString()}
                  className="p-6 rounded-2xl border border-border bg-card card-hover animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Static services */}
          {displayServices && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayServices.map((service, idx) => (
                <div
                  key={service.title}
                  className={`p-6 rounded-2xl border ${service.borderColor} bg-card card-hover animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl ${service.bgColor} border ${service.borderColor} flex items-center justify-center mb-4`}>
                    <service.icon className={`w-5 h-5 ${service.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
