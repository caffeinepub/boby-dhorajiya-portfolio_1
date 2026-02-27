import React from 'react';
import { Shield, Smartphone, Code2, Database, Loader2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useGetSkills } from '../hooks/useQueries';

const staticSkillCategories = [
  {
    id: 'primary',
    title: 'Primary Skills',
    icon: Smartphone,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    skills: [
      { name: 'Flutter', level: 95 },
      { name: 'Dart', level: 92 },
    ],
  },
  {
    id: 'secondary',
    title: 'Secondary Skills',
    icon: Code2,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/30',
    skills: [
      { name: 'React Native', level: 85 },
      { name: 'JavaScript', level: 80 },
      { name: 'TypeScript', level: 78 },
    ],
  },
  {
    id: 'security',
    title: 'Security Expertise',
    icon: Shield,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/30',
    skills: [
      { name: 'Secure API Integration', level: 90 },
      { name: 'Authentication Security', level: 92 },
      { name: 'Secure Local Storage', level: 88 },
      { name: 'Data Encryption', level: 87 },
    ],
  },
  {
    id: 'additional',
    title: 'Additional Skills',
    icon: Database,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    borderColor: 'border-chart-4/30',
    skills: [
      { name: 'Firebase', level: 85 },
      { name: 'REST APIs', level: 90 },
      { name: 'Web Development', level: 75 },
    ],
  },
];

export default function Skills() {
  const { data: backendSkills, isLoading } = useGetSkills();

  return (
    <>
      <SEOHead page="skills" defaultTitle="Skills – Boby Dhorajiya" defaultDescription="Technical skills including Flutter, Dart, React Native, and mobile security expertise." />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Technical Skills</span>
            <h1 className="section-title font-display mt-2">
              My <span className="gradient-text">Expertise</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              A comprehensive skill set focused on mobile development and security engineering.
            </p>
          </div>

          {/* Security shield highlight */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <img
                src="/assets/generated/security-shield-icon.dim_256x256.png"
                alt="Security Shield"
                className="w-20 h-20 animate-float"
              />
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
            </div>
          </div>

          {/* Static skill categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {staticSkillCategories.map((category, catIdx) => (
              <div
                key={category.id}
                className={`p-6 rounded-2xl border ${category.borderColor} bg-card card-hover animate-slide-up`}
                style={{ animationDelay: `${catIdx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl ${category.bgColor} border ${category.borderColor} flex items-center justify-center`}>
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <h2 className="font-display font-bold text-lg">{category.title}</h2>
                </div>
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className={`text-xs font-mono ${category.color}`}>{skill.level}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000`}
                          style={{
                            width: `${skill.level}%`,
                            background: `oklch(var(--primary))`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Backend skills (if any) */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {backendSkills && backendSkills.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl mb-6 text-center">Additional Skills</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {backendSkills.map((skill) => (
                  <div key={skill.id.toString()} className="skill-badge border-border text-foreground">
                    <span>{skill.name}</span>
                    {Number(skill.experience) > 0 && (
                      <span className="text-primary font-mono">{Number(skill.experience)}y</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
