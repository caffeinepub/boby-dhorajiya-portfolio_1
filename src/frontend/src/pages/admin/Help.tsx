import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import React from "react";

export default function Help() {
  const sections = [
    {
      id: "projects",
      title: "Managing Projects",
      content: `Navigate to Projects in the sidebar. Click "New Project" to add a project with title, description, URL, image, and category. Use the edit (pencil) icon to update existing projects, and the trash icon to delete them. You can filter projects by category using the dropdown.`,
    },
    {
      id: "blog",
      title: "Managing Blog Posts",
      content: `Go to Blog in the sidebar. Click "New Post" to create a blog post with title, slug, meta title, meta description, and content. The slug is used in the URL (e.g., /blog/my-post). Edit or delete posts using the action icons on each card.`,
    },
    {
      id: "services",
      title: "Managing Services",
      content:
        "Navigate to Services. Add services with a title and description. These appear on your public portfolio page. Edit or delete services as needed.",
    },
    {
      id: "skills",
      title: "Managing Skills",
      content:
        "Go to Skills. Add skills with a name, years of experience, and category (Primary, Secondary, Security, or Additional). Skills are displayed grouped by category on your portfolio.",
    },
    {
      id: "testimonials",
      title: "Managing Testimonials",
      content:
        "Navigate to Testimonials. Add client testimonials with author name and message. These are displayed on your public portfolio page.",
    },
    {
      id: "leads",
      title: "Viewing Leads",
      content:
        "Go to Leads to see all contact form submissions from visitors. You can view the name, email, and message of each lead. Delete leads you no longer need.",
    },
    {
      id: "categories",
      title: "Managing Categories",
      content:
        "Navigate to Categories to create project categories. Each category has a name and slug. Categories can be assigned to projects to help organize your portfolio.",
    },
    {
      id: "seo",
      title: "SEO Settings",
      content: `Go to SEO to configure meta titles and descriptions for each page of your portfolio. Enter the page identifier (e.g., "home", "blog", "projects") and set the meta title and description.`,
    },
    {
      id: "social",
      title: "Social Links",
      content:
        "Navigate to Social Links to manage your social media profiles. Add links for GitHub, LinkedIn, and X (Twitter). Toggle links active/inactive to control which ones appear on your portfolio.",
    },
    {
      id: "admin",
      title: "Admin Access",
      content:
        "Admin access is claimed by the first authenticated user to visit the admin panel. Once claimed, only that principal can access admin features. To reset admin access, use the resetAdmin function (requires current admin authentication).",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Help & Guide</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Everything you need to know about managing your portfolio admin panel.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Admin Panel Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
