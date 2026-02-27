import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Shield, Smartphone, Code2, Lock, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const highlights = [
  { icon: Smartphone, label: 'Mobile First', desc: 'Flutter & React Native' },
  { icon: Shield, label: 'Security Focused', desc: 'Secure by Design' },
  { icon: Code2, label: 'Cross-Platform', desc: 'iOS & Android' },
  { icon: Lock, label: 'Data Protection', desc: 'Encryption & Auth' },
];

export default function Home() {
  return (
    <>
      <SEOHead
        page="home"
        defaultTitle="Boby Dhorajiya – Flutter & React Native Developer"
        defaultDescription="Mobile app developer specializing in Flutter, React Native & mobile security."
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.png')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            Mobile App Developer · Security Specialist
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Hi, I'm{' '}
            <span className="gradient-text">Boby</span>
            {' '}—{' '}
            <br className="hidden sm:block" />
            Mobile App Developer
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up stagger-2">
            I build <span className="text-primary font-semibold">secure</span>,{' '}
            <span className="text-primary font-semibold">scalable</span>, and{' '}
            <span className="text-primary font-semibold">high-performance</span> mobile apps using Flutter & React Native.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-3">
            <Link to="/contact" className="btn-primary text-base px-8 py-4">
              Let's Build Your App
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/projects" className="btn-outline text-base px-8 py-4">
              View My Work
            </Link>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-4">
            {highlights.map((item, i) => (
              <div
                key={item.label}
                className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 card-hover"
              >
                <item.icon className="w-6 h-6 text-primary mb-2 mx-auto" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Tech Stack Strip */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-widest font-medium">Primary Tech Stack</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['Flutter', 'Dart', 'React Native', 'Firebase', 'REST APIs', 'JWT Auth', 'Encryption'].map((tech) => (
              <span key={tech} className="font-mono text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
