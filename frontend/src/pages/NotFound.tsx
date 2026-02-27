import React from 'react';
import { Link } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="font-display font-bold text-8xl text-primary/20">404</div>
        <div>
          <h1 className="font-display font-bold text-2xl mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary inline-flex">
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
