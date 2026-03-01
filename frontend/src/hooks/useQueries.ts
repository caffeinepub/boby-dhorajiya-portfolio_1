import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  BlogPost,
  Project,
  ProjectCategory,
  Service,
  Skill,
  SkillCategory,
  Testimonial,
  Lead,
  SeoSetting,
  SocialLink,
  SocialPlatform,
  Experience,
  UserProfile,
} from '../backend';
import { ExternalBlob } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// ── Dashboard Stats ───────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const [projectsResult, blogsResult, leadsResult, servicesResult, skillsResult, testimonialsResult] =
        await Promise.all([
          actor.getProjects(),
          actor.getBlogPosts(),
          actor.getLeads(),
          actor.getServices(),
          actor.getSkills(),
          actor.getTestimonials(),
        ]);

      return {
        projects: projectsResult.data?.length ?? 0,
        blogs: blogsResult.length,
        leads: leadsResult.length,
        services: servicesResult.data?.length ?? 0,
        skills: skillsResult.length,
        testimonials: testimonialsResult.length,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Blog Posts ────────────────────────────────────────────────────────────

export function useGetBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBlogPosts();
      } catch (e) {
        console.warn('Failed to fetch blog posts', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export const useGetBlogs = useGetBlogPosts;

export function useGetBlogPost(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost | null>({
    queryKey: ['blogPost', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBlogPost(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      slug: string;
      metaTitle: string;
      metaDescription: string;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlogPost(data.title, data.slug, data.metaTitle, data.metaDescription, data.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useUpdateBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      slug: string;
      metaTitle: string;
      metaDescription: string;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBlogPost(data.id, data.title, data.slug, data.metaTitle, data.metaDescription, data.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useDeleteBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

// Aliases
export const useAddBlogPost = useAddBlog;
export const useUpdateBlogPost = useUpdateBlog;
export const useDeleteBlogPost = useDeleteBlog;

// ── Projects ──────────────────────────────────────────────────────────────

export function useGetProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getProjects();
        return result.data ?? [];
      } catch (e) {
        console.warn('Failed to fetch projects', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetAllProjectsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projectsAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getProjects();
      return result.data ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      url: string;
      image: ExternalBlob | null;
      categoryId: bigint | null;
      order: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProject(data.title, data.description, data.url, data.image, data.categoryId, data.order, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      url: string;
      image: ExternalBlob | null;
      categoryId: bigint | null;
      order: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(data.id, data.title, data.description, data.url, data.image, data.categoryId, data.order, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
    },
  });
}

export function useToggleProjectActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(
        project.id,
        project.title,
        project.description,
        project.url,
        project.image ?? null,
        project.categoryId ?? null,
        project.order,
        !project.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
    },
  });
}

export function useReorderProjects() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderProjects(orderedIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
    },
  });
}

// ── Project Categories ────────────────────────────────────────────────────

export function useGetProjectCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<ProjectCategory[]>({
    queryKey: ['projectCategories'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getProjectCategories();
        return result.data ?? [];
      } catch (e) {
        console.warn('Failed to fetch project categories', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export const useGetCategories = useGetProjectCategories;

export function useAddProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; order: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProjectCategory(data.name, data.slug, data.order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
}

export function useUpdateProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; slug: string; order: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProjectCategory(data.id, data.name, data.slug, data.order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
}

export function useDeleteProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProjectCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
}

// ── Services ──────────────────────────────────────────────────────────────

export function useGetServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getServices();
        return result.data ?? [];
      } catch (e) {
        console.warn('Failed to fetch services', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addService(data.title, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(data.id, data.title, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ── Skills ────────────────────────────────────────────────────────────────

export function useGetSkills() {
  const { actor, isFetching } = useActor();

  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSkills();
      } catch (e) {
        console.warn('Failed to fetch skills', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Alias for backward compatibility */
export const useListSkills = useGetSkills;

export function useCreateSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; experience: bigint; category: SkillCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSkill(data.name, data.experience, data.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useUpdateSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; experience: bigint; category: SkillCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSkill(data.id, data.name, data.experience, data.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSkill(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

// ── Testimonials ──────────────────────────────────────────────────────────

export function useGetTestimonials() {
  const { actor, isFetching } = useActor();

  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTestimonials();
      } catch (e) {
        console.warn('Failed to fetch testimonials', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddTestimonial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTestimonial(data.author, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTestimonial(data.id, data.author, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTestimonial(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────

export function useGetLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitLead(data.name, data.email, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// ── SEO Settings ──────────────────────────────────────────────────────────

export function useGetSeoSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<SeoSetting[]>({
    queryKey: ['seoSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSeoSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSeoSettingByPage(page: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SeoSetting | null>({
    queryKey: ['seoSetting', page],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSeoSetting(page);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSeoSetting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { page: string; metaTitle: string; metaDescription: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSeoSetting(data.page, data.metaTitle, data.metaDescription);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting', variables.page] });
    },
  });
}

export function useDeleteSeoSetting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSeoSetting(page, '', '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
    },
  });
}

// ── Social Links ──────────────────────────────────────────────────────────

export function useGetSocialLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<SocialLink[]>({
    queryKey: ['socialLinks'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSocialLinks();
      } catch (e) {
        console.warn('Failed to fetch social links', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { platform: SocialPlatform; url: string; icon: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSocialLink(data.platform, data.url, data.icon, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useUpdateSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; platform: SocialPlatform; url: string; icon: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSocialLink(data.id, data.platform, data.url, data.icon, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useDeleteSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSocialLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useToggleSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: SocialLink) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSocialLink(link.id, link.platform, link.url, link.icon, !link.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

// ── Experiences ───────────────────────────────────────────────────────────

export function useGetExperiences() {
  const { actor, isFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getExperiences();
        return result.data ?? [];
      } catch (e) {
        console.warn('Failed to fetch experiences', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      company: string;
      period: string;
      description: string;
      responsibilities: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addExperience(data.title, data.company, data.period, data.description, data.responsibilities);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

/** Alias so ExperienceManagement can import useCreateExperience */
export const useCreateExperience = useAddExperience;

export function useUpdateExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      company: string;
      period: string;
      description: string;
      responsibilities: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateExperience(data.id, data.title, data.company, data.period, data.description, data.responsibilities);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteExperience(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
