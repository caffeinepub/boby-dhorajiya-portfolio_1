import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import { Link } from '@tanstack/react-router';
import { Loader2, HelpCircle, FolderOpen, Tag, Zap, Search, Users, Share2, Clock } from 'lucide-react';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

interface HelpSectionProps {
  icon: React.ElementType;
  title: string;
  steps: string[];
}

function HelpSection({ icon: Icon, title, steps }: HelpSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HelpContent() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Help Guide</h1>
                <p className="text-muted-foreground mt-1">Step-by-step instructions for managing your portfolio.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <HelpSection
              icon={FolderOpen}
              title="How to Add a Project"
              steps={[
                'Navigate to Projects in the sidebar.',
                'Click the "Add Project" button in the top right.',
                'Fill in the project title (required) and description (required).',
                'Optionally add a project URL and upload an image.',
                'Select a category from the dropdown (e.g., Mobile App Development).',
                'Click "Save Project" to publish it to your portfolio.',
              ]}
            />

            <HelpSection
              icon={Tag}
              title="How to Assign a Category to a Project"
              steps={[
                'First, make sure the category exists — go to Categories in the sidebar.',
                'If the category doesn\'t exist, click "Add Category", enter a name and slug, then save.',
                'Go to Projects in the sidebar.',
                'Click the edit (pencil) icon on the project you want to update.',
                'In the edit form, find the "Category" dropdown and select the desired category.',
                'Click "Save Project" to apply the change.',
              ]}
            />

            <HelpSection
              icon={Zap}
              title="How to Edit Skills"
              steps={[
                'Navigate to Skills in the sidebar.',
                'You will see a list of all your skills grouped by category.',
                'Click the edit (pencil) icon next to the skill you want to update.',
                'Modify the skill name, years of experience, or category as needed.',
                'Click "Save Skill" to apply the changes.',
                'To add a new skill, click "Add Skill" and fill in the form.',
              ]}
            />

            <HelpSection
              icon={Search}
              title="How to Update SEO Settings"
              steps={[
                'Navigate to SEO Settings in the sidebar.',
                'Click "Add SEO Setting" to configure a new page.',
                'Select the page from the dropdown (e.g., home, about, projects).',
                'Enter a meta title (shown in browser tabs and search results).',
                'Enter a meta description (shown in search result snippets, aim for 150-160 characters).',
                'Click "Save SEO Setting". Changes take effect immediately.',
                'To update an existing setting, click the edit icon next to it.',
              ]}
            />

            <HelpSection
              icon={Users}
              title="How to Manage Leads"
              steps={[
                'Navigate to Leads in the sidebar.',
                'You will see all contact form submissions with name, email, message, and date.',
                'Use the search bar to filter leads by name or email.',
                'To delete a lead, click the trash icon and confirm in the dialog.',
                'Leads cannot be edited — they are read-only records of contact form submissions.',
                'Reply to leads directly by clicking the email address to open your email client.',
              ]}
            />

            <HelpSection
              icon={Share2}
              title="How to Update Social Links"
              steps={[
                'Navigate to Social Links in the sidebar.',
                'You will see your GitHub, LinkedIn, and X (Twitter) links.',
                'Use the toggle switch to show or hide a link on the public website.',
                'Click the edit (pencil) icon to update the URL for a link.',
                'To add a new social link, click "Add Link", select the platform, and enter the URL.',
                'Only active (toggled on) links will appear in the hero section and footer.',
              ]}
            />

            <HelpSection
              icon={Clock}
              title="How to Change Availability Time"
              steps={[
                'The availability time is currently set to "9:00 AM – 8:00 PM" and is displayed in the hero badge, contact page, and footer.',
                'To update it, open the source code and search for "9:00 AM – 8:00 PM".',
                'Update the time string in the following files: Home.tsx (hero badge), Contact.tsx (contact info), Footer.tsx (contact section).',
                'Alternatively, you can use the SEO Settings to add a custom note for the contact page.',
                'Future versions will support dynamic availability management from the admin panel.',
              ]}
            />
          </div>

          <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
            <h3 className="font-bold text-foreground mb-2">Need More Help?</h3>
            <p className="text-muted-foreground text-sm">
              If you encounter any issues or need assistance with a feature not covered here, please reach out via the contact form or check the project documentation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Help() {
  return <AdminGuard><HelpContent /></AdminGuard>;
}
