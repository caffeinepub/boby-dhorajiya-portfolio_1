import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ADMIN_EMAIL = "dhorajiyaboby8@gmail.com";
const STORAGE_KEY = "google_admin_user";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthContextValue {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextValue | null>(null);

export function GoogleAuthProvider({
  children,
}: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: GoogleUser = JSON.parse(stored);
        if (parsed.email && parsed.name) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // Load the Google Identity Services script
  useEffect(() => {
    if (document.getElementById("google-gsi-script")) return;
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId =
        "250579405228-4od4komma9bmf4js267qe2p63go8anga.apps.googleusercontent.com";
      if (!clientId || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      try {
        const parts = response.credential.split(".");
        if (parts.length < 2) return;
        const payload = JSON.parse(atob(parts[1])) as {
          email?: string;
          name?: string;
          picture?: string;
        };
        if (!payload.email) return;
        const googleUser: GoogleUser = {
          email: payload.email,
          name: payload.name ?? payload.email,
          picture: payload.picture ?? "",
        };
        if (googleUser.email === ADMIN_EMAIL) {
          setUser(googleUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          // Still set user so AdminGuard can show "Access Denied"
          setUser(googleUser);
        }
      } catch {
        console.error("Failed to decode Google credential");
      }
    },
    [],
  );

  const signIn = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      console.warn("Google Identity Services not loaded yet");
    }
  }, []);

  const signOut = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isAuthenticated = user !== null && user.email === ADMIN_EMAIL;

  return (
    <GoogleAuthContext.Provider
      value={{ user, isAuthenticated, isLoading, signIn, signOut }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth(): GoogleAuthContextValue {
  const ctx = useContext(GoogleAuthContext);
  if (!ctx) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return ctx;
}
