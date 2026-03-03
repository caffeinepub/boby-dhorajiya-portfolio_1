import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SEOHead from "../components/SEOHead";
import { useSubmitLead } from "../hooks/useQueries";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const submitLead = useSubmitLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLead.mutateAsync({ name, email, message });
      toast.success("Message sent! I'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <SEOHead
        page="contact"
        defaultTitle="Contact - Portfolio"
        defaultDescription="Get in touch to discuss your project or collaboration."
      />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Contact</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a project in mind? Let's talk about how we can work together.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Send me an email anytime
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Available for remote work worldwide
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Usually within 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell me about your project..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitLead.isPending}
                    >
                      {submitLead.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
