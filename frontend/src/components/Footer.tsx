import { Link } from '@tanstack/react-router';
import { Code2, Heart } from 'lucide-react';
import { useGetSocialLinks } from '../hooks/useQueries';
import { SiGithub, SiLinkedin, SiX } from 'react-icons/si';

const footerLinks = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Services' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog', label: 'Blog' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  const { data: socialLinks } = useGetSocialLinks();
  const activeSocialLinks = socialLinks?.filter(l => l.isActive) ?? [];
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'unknown-app');

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <SiGithub className="h-5 w-5" />;
      case 'linkedin': return <SiLinkedin className="h-5 w-5" />;
      case 'x': return <SiX className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Code2 className="h-6 w-6" />
              <span>Portfolio</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A professional portfolio showcasing projects, skills, and experience in software development.
            </p>
            {activeSocialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {activeSocialLinks.map(link => (
                  <a
                    key={link.id.toString()}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Get In Touch</h3>
            <p className="text-muted-foreground text-sm">
              Interested in working together? Feel free to reach out.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              Contact Me →
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {year} Portfolio. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-destructive text-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
