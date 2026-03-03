import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import React from "react";
import SEOHead from "../components/SEOHead";

const values = [
  "Security-first development approach",
  "Clean, maintainable code architecture",
  "Performance optimization at every layer",
  "Cross-platform consistency",
  "Continuous learning & improvement",
];

export default function About() {
  return (
    <>
      <SEOHead
        page="about"
        defaultTitle="About – Boby Dhorajiya"
        defaultDescription="Learn about Boby Dhorajiya, a mobile app developer specializing in Flutter and React Native."
      />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">
              About Me
            </span>
            <h1 className="section-title font-display mt-2">
              Passionate About{" "}
              <span className="gradient-text">Secure Mobile</span> Development
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image placeholder + stats */}
            <div className="space-y-6 animate-slide-in-left">
              <div className="relative">
                <div className="w-full aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto">
                      <span className="text-4xl font-display font-bold text-primary">
                        BD
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-xl">
                        Boby Dhorajiya
                      </p>
                      <p className="text-primary text-sm font-medium">
                        Mobile App Developer
                      </p>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-card-dark">
                  <p className="text-xs text-muted-foreground">
                    Specialization
                  </p>
                  <p className="font-semibold text-sm text-primary">
                    Flutter & React Native
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { value: "3+", label: "Years Exp." },
                  { value: "20+", label: "Apps Built" },
                  { value: "100%", label: "Secure Code" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-xl bg-card border border-border"
                  >
                    <p className="text-2xl font-display font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Bio */}
            <div className="space-y-6 animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Freelance Mobile App Developer</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Available Worldwide (Remote)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Open to New Projects</span>
                </div>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  Boby is a mobile-focused developer specializing in Flutter and
                  React Native, with strong expertise in building secure and
                  scalable applications for startups and enterprises.
                </p>
                <p>
                  With a deep understanding of mobile security principles, Boby
                  ensures every application is built with security at its core —
                  from secure API integration and authentication to data
                  encryption and secure local storage.
                </p>
                <p>
                  Whether you're a startup looking to launch your first app or
                  an enterprise needing to modernize your mobile presence, Boby
                  brings the technical expertise and security mindset to deliver
                  exceptional results.
                </p>
              </div>

              {/* Values */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Core Values
                </h3>
                <ul className="space-y-2">
                  {values.map((value) => (
                    <li key={value} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/contact" className="btn-primary inline-flex">
                Work With Me <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
