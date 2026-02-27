import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Shield, Smartphone, Globe, Code2, CheckCircle,
  ChevronDown, Star, Zap, Lock, Server, Database, Layers
} from 'lucide-react';
import { SiGithub, SiLinkedin, SiX } from 'react-icons/si';
import { SiFlutter, SiDart, SiReact, SiFirebase, SiTypescript, SiNodedotjs } from 'react-icons/si';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useGetSocialLinks } from '../hooks/useQueries';
import { SocialPlatform } from '../backend';

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === SocialPlatform.github) return <SiGithub size={20} />;
  if (platform === SocialPlatform.linkedin) return <SiLinkedin size={20} />;
  if (platform === SocialPlatform.x) return <SiX size={20} />;
  return null;
}

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

const techStack = [
  { name: 'Flutter', icon: SiFlutter, color: 'text-blue-400' },
  { name: 'Dart', icon: SiDart, color: 'text-blue-500' },
  { name: 'React Native', icon: SiReact, color: 'text-cyan-400' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-600' },
  { name: 'Firebase', icon: SiFirebase, color: 'text-yellow-500' },
  { name: 'Node.js', icon: SiNodedotjs, color: 'text-green-500' },
];

const faqs = [
  {
    q: 'What platforms do you develop for?',
    a: 'I specialize in cross-platform mobile development using Flutter and React Native, delivering apps for both iOS and Android from a single codebase. I also build web applications using React and TypeScript.',
  },
  {
    q: 'How do you ensure app security?',
    a: 'Security is built into every layer — from secure authentication flows (OAuth, biometrics), encrypted local storage, to hardened API communication with certificate pinning and token management.',
  },
  {
    q: 'What is your typical project timeline?',
    a: 'A standard mobile app takes 6–12 weeks depending on complexity. I follow an agile process with weekly updates so you always know where things stand.',
  },
  {
    q: 'Do you provide post-launch support?',
    a: 'Yes. I offer maintenance packages covering bug fixes, OS compatibility updates, performance monitoring, and feature enhancements after launch.',
  },
  {
    q: 'Can you work with an existing codebase?',
    a: 'Absolutely. I regularly audit, refactor, and extend existing Flutter and React Native projects, including security hardening of legacy codebases.',
  },
  {
    q: 'What are your working hours?',
    a: '🕘 I am available Monday–Saturday, 9:00 AM – 8:00 PM IST. I respond to messages within a few hours during working hours.',
  },
];

export default function Home() {
  const { data: socialLinks } = useGetSocialLinks();
  const activeLinks = (socialLinks ?? []).filter((l) => l.isActive);

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.png')" }}
          role="img"
          aria-label="Portfolio hero background"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/65 to-blue-950/70" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center">
          {/* Availability badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            🕘 Available: 9:00 AM – 8:00 PM
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            Hi, I'm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Boby Dhorajiya
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl md:text-2xl text-slate-200 font-medium mb-4"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
          >
            Senior Mobile App Developer
          </p>

          <p
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
          >
            Building secure, cross-platform mobile apps with Flutter & React Native.
            Security-first mindset. Clean architecture. Scalable solutions.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/projects"
              className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:scale-105"
              aria-label="View my projects"
            >
              View My Work <ArrowRight size={18} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full border border-white/30 transition-all backdrop-blur-sm"
              aria-label="Contact me"
            >
              Get In Touch
            </Link>
          </div>

          {/* Social links */}
          {activeLinks.length > 0 && (
            <div className="flex justify-center gap-4">
              {activeLinks.map((link) => (
                <a
                  key={String(link.id)}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${link.platform} profile`}
                  className="text-slate-300 hover:text-cyan-400 transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ── Why Work With Me ─────────────────────────────────────────────── */}
      <section className="py-20 bg-background" aria-label="Why work with me">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Work With Me?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                I bring more than just code — I bring a security-first mindset, cross-platform expertise, and a commitment to your success.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Security-First Mindset',
                desc: 'Every app I build is hardened against common vulnerabilities — from secure storage to encrypted API communication.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
              {
                icon: Smartphone,
                title: 'Cross-Platform Expert',
                desc: 'Flutter & React Native specialist delivering native-quality apps for iOS and Android from a single codebase.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                icon: Layers,
                title: 'Scalable Architecture',
                desc: 'Clean, modular code that scales with your business — easy to maintain, extend, and hand off to any team.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: Star,
                title: 'Clear Communication',
                desc: 'Weekly progress updates, transparent timelines, and always-available support during working hours.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
              },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/40 transition-colors">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon size={24} className={item.color} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── My Development Process ───────────────────────────────────────── */}
      <section className="py-20 bg-card/50" aria-label="Development process">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">My Development Process</h2>
              <p className="text-muted-foreground text-lg">A proven, structured approach from idea to launch.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals, users, and technical requirements.' },
              { step: '02', title: 'Design', desc: 'Wireframes, UI/UX design, and architecture planning.' },
              { step: '03', title: 'Build', desc: 'Agile development with weekly demos and feedback loops.' },
              { step: '04', title: 'Test', desc: 'Security audits, performance testing, and QA across devices.' },
              { step: '05', title: 'Launch', desc: 'App store deployment, monitoring, and post-launch support.' },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <div className="relative bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/40 transition-colors">
                  <div className="text-3xl font-black text-primary/20 mb-2">{item.step}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security-First Approach ──────────────────────────────────────── */}
      <section className="py-20 bg-background" aria-label="Security-first approach">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div>
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-cyan-500/20">
                  <Shield size={14} /> Security-First Development
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Security Built Into Every Layer
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  I don't bolt on security as an afterthought. From day one, every architectural decision considers threat models, data protection, and compliance requirements.
                </p>
                <ul className="space-y-3">
                  {[
                    'Secure authentication (OAuth 2.0, biometrics, MFA)',
                    'Encrypted local storage with platform-native APIs',
                    'Certificate pinning & API security hardening',
                    'OWASP Mobile Top 10 compliance',
                    'Regular security code audits',
                    'Secure CI/CD pipeline practices',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle size={16} className="text-cyan-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="relative">
                <img
                  src="/assets/generated/security-shield-icon.dim_256x256.png"
                  alt="Security shield icon representing security-first development"
                  className="w-48 h-48 mx-auto opacity-80"
                />
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: Lock, label: 'Auth Security', value: 'OAuth + Biometrics' },
                    { icon: Database, label: 'Data Encryption', value: 'AES-256' },
                    { icon: Server, label: 'API Security', value: 'Cert Pinning' },
                    { icon: Zap, label: 'Performance', value: '60fps Smooth' },
                  ].map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                      <item.icon size={20} className="text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Overview ──────────────────────────────────────────── */}
      <section className="py-20 bg-card/50" aria-label="Tech stack overview">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Tech Stack</h2>
              <p className="text-muted-foreground text-lg">The tools I use to build world-class mobile experiences.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <AnimatedSection key={i}>
                <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-primary/40 transition-colors group">
                  <tech.icon size={36} className={`${tech.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-foreground">{tech.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700" aria-label="Call to action">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Ready to Build Something Secure & Scalable?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Let's turn your idea into a production-ready mobile app. I'm available for freelance projects and full-time opportunities.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-4 rounded-full hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
              aria-label="Start a project with me"
            >
              Start a Project <ArrowRight size={18} />
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background" aria-label="Frequently asked questions">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-lg">Everything you need to know before we work together.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/40"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
