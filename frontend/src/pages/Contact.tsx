import React, { useState } from 'react';
import { Mail, MessageSquare, User, Send, CheckCircle2, Loader2, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SEOHead from '../components/SEOHead';
import { useContactForm } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contactMutation = useContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    try {
      await contactMutation.mutateAsync({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      toast.success('Message sent successfully! I\'ll get back to you soon.');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <SEOHead page="contact" defaultTitle="Contact – Boby Dhorajiya" defaultDescription="Get in touch with Boby Dhorajiya for mobile app development projects." />

      <div className="pt-24 section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="text-primary text-sm font-mono font-medium uppercase tracking-widest">Get In Touch</span>
            <h1 className="section-title font-display mt-2">
              Let's <span className="gradient-text">Build Together</span>
            </h1>
            <p className="section-subtitle text-muted-foreground mx-auto">
              Have a project in mind? I'd love to hear about it. Send me a message and let's discuss.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6 animate-slide-in-left">
              <div>
                <h2 className="font-display font-bold text-xl mb-4">Contact Information</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Available for freelance projects, consulting, and full-time opportunities. Let's create something amazing together.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: 'boby@example.com' },
                  { icon: Phone, label: 'Availability', value: 'Mon–Fri, 9am–6pm IST' },
                  { icon: MapPin, label: 'Location', value: 'Remote / Worldwide' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm text-primary font-medium mb-1">🚀 Currently Available</p>
                <p className="text-xs text-muted-foreground">Open to new projects and collaborations.</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3 animate-slide-up">
              {submitted ? (
                <div className="h-full flex items-center justify-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-xl">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm">
                      Thank you for reaching out. I'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-outline text-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl border border-border bg-card space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" /> Name *
                      </Label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary" /> Email *
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" /> Message *
                    </Label>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me about your project..."
                      rows={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactMutation.isPending || !name.trim() || !email.trim() || !message.trim()}
                    className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
