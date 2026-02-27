import { Link } from '@tanstack/react-router';
import { Heart, Clock, Mail, MapPin } from 'lucide-react';
import { SiGithub, SiLinkedin, SiX } from 'react-icons/si';
import { useGetSocialLinks } from '../hooks/useQueries';
import { SocialPlatform } from '../backend';

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === SocialPlatform.github) return <SiGithub size={18} />;
  if (platform === SocialPlatform.linkedin) return <SiLinkedin size={18} />;
  if (platform === SocialPlatform.x) return <SiX size={18} />;
  return null;
}

export default function Footer() {
  const { data: socialLinks } = useGetSocialLinks();
  const activeLinks = (socialLinks ?? []).filter((l) => l.isActive);
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'boby-portfolio');

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Boby Dhorajiya</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Senior Mobile App Developer specializing in Flutter, React Native, and security-first development.
            </p>
            {activeLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {activeLinks.map((link) => (
                  <a
                    key={String(link.id)}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${link.platform} profile`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'About', path: '/about' },
                { label: 'Projects', path: '/projects' },
                { label: 'Skills', path: '/skills' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>dhorajiyaboby8@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>India</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} />
                <span>🕘 Available: 9:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Boby Dhorajiya. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={14} className="text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
