import { useState } from 'react';
import { useProcessContactForm } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const { mutate, isPending } = useProcessContactForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    mutate(form, {
      onSuccess: () => {
        toast.success('Message sent! I\'ll get back to you soon.');
        setForm({ name: '', email: '', message: '' });
      },
      onError: () => toast.error('Failed to send message. Please try again.'),
    });
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">Get In Touch</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have a project in mind? Let's talk. I'm available for freelance work and full-time opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:dhorajiyaboby8@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    dhorajiyaboby8@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted-foreground text-sm">India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Availability</p>
                  <p className="text-muted-foreground text-sm">🕘 Available: 9:00 AM – 8:00 PM IST</p>
                  <p className="text-muted-foreground text-xs mt-1">Monday – Saturday</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-card border border-border rounded-2xl">
              <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
              <p className="text-muted-foreground text-sm">
                I typically respond within a few hours during working hours. For urgent inquiries, please mention it in your message.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-foreground mb-1.5 block">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={isPending}
                  required
                  aria-label="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground mb-1.5 block">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={isPending}
                  required
                  aria-label="Your email address"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-foreground mb-1.5 block">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={isPending}
                  required
                  rows={5}
                  aria-label="Your message"
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</>
                ) : (
                  <><Send size={16} className="mr-2" /> Send Message</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
