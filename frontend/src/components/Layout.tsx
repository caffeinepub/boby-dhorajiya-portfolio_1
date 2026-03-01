import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import ProfileSetup from './ProfileSetup';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ProfileSetup />
    </div>
  );
}
