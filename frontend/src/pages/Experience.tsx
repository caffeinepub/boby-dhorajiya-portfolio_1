import { Briefcase, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function Experience() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">Experience</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            My professional journey building secure, cross-platform mobile applications.
          </p>
        </div>

        {/* Single Experience Entry */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

          <div className="relative sm:pl-16">
            {/* Timeline dot */}
            <div className="hidden sm:flex absolute left-0 top-6 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary items-center justify-center">
              <Briefcase size={20} className="text-primary" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-colors">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Senior Mobile App Developer</h2>
                  <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                    <Briefcase size={16} />
                    Nexus IT Solution
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>2022 – Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>India (Remote / On-site)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                Leading mobile application development at Nexus IT Solution, delivering high-quality cross-platform apps
                for enterprise and consumer clients. Responsible for full-cycle development from architecture design to
                App Store deployment, with a strong emphasis on security, performance, and maintainability.
              </p>

              {/* Key Responsibilities */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Key Responsibilities & Achievements</h3>
                <ul className="space-y-3">
                  {[
                    'Architected and developed production Flutter applications for iOS and Android, serving thousands of active users with 60fps performance.',
                    'Built cross-platform React Native apps with shared business logic, reducing development time by 40% compared to native development.',
                    'Implemented secure API handling with JWT authentication, token refresh flows, and certificate pinning to prevent MITM attacks.',
                    'Designed and integrated mobile authentication security including OAuth 2.0, biometric authentication (Face ID / Fingerprint), and multi-factor authentication.',
                    'Implemented secure storage solutions using platform-native encrypted storage (Keychain on iOS, Keystore on Android) for sensitive user data.',
                    'Applied web application security practices including input validation, XSS prevention, and OWASP Mobile Top 10 compliance across all projects.',
                    'Conducted security code reviews and vulnerability assessments, identifying and remediating critical security issues before production deployment.',
                    'Mentored junior developers on Flutter best practices, clean architecture patterns, and security-first development principles.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <CheckCircle size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['Flutter', 'Dart', 'React Native', 'JavaScript', 'TypeScript', 'Firebase', 'REST APIs', 'OAuth 2.0', 'Biometrics', 'Secure Storage', 'OWASP', 'Git'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
