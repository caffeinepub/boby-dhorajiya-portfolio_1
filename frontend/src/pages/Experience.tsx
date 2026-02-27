import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import SEOHead from '../components/SEOHead';

const experiences = [
  {
    role: 'Freelance Mobile App Developer',
    company: 'Self-Employed',
    period: '2021 – Present',
    location: 'Remote / Worldwide',
    type: 'Freelance',
    description: 'Working on production mobile applications for startups and enterprises using Flutter and React Native. Delivering secure, scalable, and high-performance apps across iOS and Android platforms.',
    highlights: [
      'Built 20+ production mobile apps using Flutter & React Native',
      'Implemented enterprise-grade security in banking and healthcare apps',
      'Integrated Firebase, REST APIs, and third-party SDKs',
      'Conducted mobile security audits and code reviews',
      'Delivered projects on time with 100% client satisfaction',
    ],
    tech: ['Flutter', 'Dart', 'React Native', 'Firebase', 'REST APIs', 'JWT', 'Encryption'],
  },
  {
    role: 'Mobile App Developer',
    company: 'Tech Startup (Contract)',
    period: '2020 – 2021',
    location: 'Remote',
    type: 'Contract',
    description: 'Developed cross-platform mobile applications with a focus on performance optimization and security best practices.',
    highlights: [
      'Developed Flutter apps from concept to App Store/Play Store deployment',
      'Implemented secure authentication flows with biometrics',
      'Optimized app performance reducing load times by 40%',
      'Collaborated with backend teams on API design and security',
    ],
    tech: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Git'],
  },
];

export default function Experience() {
  return (
    <>
      <SEOHead page="experience" defaultTitle="Experience – Boby Dhorajiya" defaultDescription="Professional experience as a freelance mobile app developer." />

      <div className="pt-24 section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Career</span>
            <h1 className="section-title font-display mt-2">
              Work <span className="gradient-text">Experience</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              Building production-grade mobile applications with security at the forefront.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-8">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative flex gap-6 animate-slide-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center flex-shrink-0 z-10">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 rounded-2xl border border-border bg-card card-hover">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-display font-bold text-xl">{exp.role}</h3>
                        <p className="text-primary font-medium">{exp.company}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {exp.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {exp.period}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {exp.location}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{exp.description}</p>

                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted text-muted-foreground border border-border">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link to="/contact" className="btn-primary inline-flex">
              Hire Me <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
