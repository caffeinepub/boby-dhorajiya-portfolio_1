import { useGetSkills } from '../hooks/useQueries';
import { SkillCategory } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Shield, Star, Plus } from 'lucide-react';

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  [SkillCategory.primary]: {
    label: 'Primary Skills',
    icon: Star,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  [SkillCategory.secondary]: {
    label: 'Secondary Skills',
    icon: Zap,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  [SkillCategory.security]: {
    label: 'Security Skills',
    icon: Shield,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  [SkillCategory.additional]: {
    label: 'Additional Skills',
    icon: Plus,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
};

const categoryOrder = [SkillCategory.primary, SkillCategory.secondary, SkillCategory.security, SkillCategory.additional];

export default function Skills() {
  const { data: skills, isLoading, error } = useGetSkills();

  const grouped = (skills ?? []).reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category as unknown as string;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(skill);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">Skills</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise across mobile, web, and security domains.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => <Skeleton key={j} className="h-10 w-full" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-muted-foreground py-12">
            <p>Failed to load skills. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && (skills ?? []).length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>No skills added yet.</p>
          </div>
        )}

        {!isLoading && !error && (skills ?? []).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categoryOrder.map((cat) => {
              const catKey = cat as unknown as string;
              const catSkills = grouped[catKey];
              if (!catSkills || catSkills.length === 0) return null;
              const config = categoryConfig[catKey];
              const Icon = config.icon;
              return (
                <div key={catKey} className={`bg-card border ${config.border} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <Icon size={20} className={config.color} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{config.label}</h2>
                  </div>
                  <div className="space-y-4">
                    {catSkills.map((skill) => {
                      const exp = Number(skill.experience);
                      const maxExp = 10;
                      const pct = Math.min((exp / maxExp) * 100, 100);
                      return (
                        <div key={String(skill.id)}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-foreground">{skill.name}</span>
                            <span className="text-xs text-muted-foreground">{exp} yr{exp !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${config.bg.replace('/10', '/60')}`}
                              style={{ width: `${pct}%`, background: `var(--tw-gradient-from, currentColor)` }}
                            >
                              <div className={`h-full rounded-full ${config.color.replace('text-', 'bg-')}`} style={{ width: '100%' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
