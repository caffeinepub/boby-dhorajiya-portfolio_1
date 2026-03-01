import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type {
  Project,
  ProjectCategory,
  BlogPost,
  Testimonial,
  Service,
  Skill,
  SkillCategory,
  Lead,
  SeoSetting,
  SocialLink,
  SocialPlatform,
  Experience,
  UserProfile,
} from '../backend';
import { ExternalBlob } from '../backend';

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

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
      toast.success('Profile saved!');
    },
    onError: () => toast.error('Failed to save profile'),
  });
}

// ── Projects ──────────────────────────────────────────────────────────────────

/** Returns all projects (active + inactive) — used by both admin and public pages */
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
        console.warn('Failed to fetch projects:', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Admin version — returns all projects (active + inactive) */
export function useGetAllProjectsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ['projects-admin'],
    queryFn: async () => {
      if (!actor) return [];
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
      const result = await actor.addProject(
        data.title,
        data.description,
        data.url,
        data.image,
        data.categoryId,
        data.order,
        data.isActive,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to add project');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
      toast.success('Project added!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      const result = await actor.updateProject(
        data.id,
        data.title,
        data.description,
        data.url,
        data.image,
        data.categoryId,
        data.order,
        data.isActive,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to update project');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
      toast.success('Project updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteProject(id);
      if (!result.success) throw new Error(result.error ?? 'Failed to delete project');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
      toast.success('Project deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleProjectActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProject(
        project.id,
        project.title,
        project.description,
        project.url,
        project.image ?? null,
        project.categoryId ?? null,
        project.order,
        !project.isActive,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to toggle project');
      return result.data!;
    },
    onSuccess: (_, project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
      toast.success(project.isActive ? 'Project deactivated' : 'Project activated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReorderProjects() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reorderProjects(orderedIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
    },
    onError: (e: Error) => toast.error('Failed to save order: ' + e.message),
  });
}

export function useUpdateProjectOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { project: Project; newOrder: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProject(
        data.project.id,
        data.project.title,
        data.project.description,
        data.project.url,
        data.project.image ?? null,
        data.project.categoryId ?? null,
        data.newOrder,
        data.project.isActive,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to update order');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-admin'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Project Categories ────────────────────────────────────────────────────────

export function useGetProjectCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<ProjectCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getProjectCategories();
        return result.data ?? [];
      } catch (e) {
        console.warn('Failed to fetch categories:', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Aliases for backward compatibility */
export const useGetCategories = useGetProjectCategories;
export const useListCategories = useGetProjectCategories;

export function useAddProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; order: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addProjectCategory(data.name, data.slug, data.order);
      if (!result.success) throw new Error(result.error ?? 'Failed to add category');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
export const useCreateCategory = useAddProjectCategory;

export function useUpdateProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; slug: string; order: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProjectCategory(data.id, data.name, data.slug, data.order);
      if (!result.success) throw new Error(result.error ?? 'Failed to update category');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
export const useUpdateCategory = useUpdateProjectCategory;

export function useDeleteProjectCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteProjectCategory(id);
      if (!result.success) throw new Error(result.error ?? 'Failed to delete category');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
export const useDeleteCategory = useDeleteProjectCategory;

export function useUpdateCategoryOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { category: ProjectCategory; newOrder: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProjectCategory(
        data.category.id,
        data.category.name,
        data.category.slug,
        data.newOrder,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to update order');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

export function useGetBlogPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBlogPosts();
      } catch (e) {
        console.warn('Failed to fetch blog posts:', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Alias for backward compatibility */
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

/** Fetch a blog post by slug — finds it from the full list */
export function useGetBlogBySlug(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost | null>({
    queryKey: ['blogPost', 'slug', slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      const posts = await actor.getBlogPosts();
      return posts.find((p) => p.slug === slug) ?? null;
    },
    enabled: !!actor && !isFetching && !!slug,
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
      toast.success('Blog post added!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Blog post updated!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Blog post deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export function useGetTestimonials() {
  const { actor, isFetching } = useActor();
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTestimonials();
      } catch (e) {
        console.warn('Failed to fetch testimonials:', e);
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
      toast.success('Testimonial added!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Testimonial updated!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Testimonial deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Services ──────────────────────────────────────────────────────────────────

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
        console.warn('Failed to fetch services:', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Aliases for backward compatibility */
export const useListServices = useGetServices;

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addService(data.title, data.description);
      if (!result.success) throw new Error(result.error ?? 'Failed to add service');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service added!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateService(data.id, data.title, data.description);
      if (!result.success) throw new Error(result.error ?? 'Failed to update service');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteService(id);
      if (!result.success) throw new Error(result.error ?? 'Failed to delete service');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Skills ────────────────────────────────────────────────────────────────────

export function useGetSkills() {
  const { actor, isFetching } = useActor();
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSkills();
      } catch (e) {
        console.warn('Failed to fetch skills:', e);
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
      toast.success('Skill added!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Skill updated!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Skill deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export function useGetLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) return [];
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
      toast.success('Message sent!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
export const useProcessContactForm = useSubmitLead;

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
      toast.success('Lead deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── SEO Settings ──────────────────────────────────────────────────────────────

export function useGetSeoSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SeoSetting[]>({
    queryKey: ['seoSettings'],
    queryFn: async () => {
      if (!actor) return [];
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
    enabled: !!actor && !isFetching && !!page,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
      toast.success('SEO setting saved!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSeoSetting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_page: string) => {
      if (!actor) throw new Error('Actor not available');
      // SEO settings don't have a delete endpoint; overwrite with empty values
      return actor.saveSeoSetting(_page, '', '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
      toast.success('SEO setting cleared!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Social Links ──────────────────────────────────────────────────────────────

export function useGetSocialLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<SocialLink[]>({
    queryKey: ['socialLinks'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSocialLinks();
      } catch (e) {
        console.warn('Failed to fetch social links:', e);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Alias for backward compatibility */
export const useListSocialLinks = useGetSocialLinks;

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
      toast.success('Social link added!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
export const useCreateSocialLink = useAddSocialLink;

export function useUpdateSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      platform: SocialPlatform;
      url: string;
      icon: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSocialLink(data.id, data.platform, data.url, data.icon, data.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
      toast.success('Social link updated!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Social link toggled!');
    },
    onError: (e: Error) => toast.error(e.message),
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
      toast.success('Social link deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Experiences ───────────────────────────────────────────────────────────────

export function useGetExperiences() {
  const { actor, isFetching } = useActor();
  return useQuery<Experience[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getExperiences();
      return result.data ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

/** Alias for backward compatibility */
export const useListExperiences = useGetExperiences;

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
      const result = await actor.addExperience(
        data.title,
        data.company,
        data.period,
        data.description,
        data.responsibilities,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to add experience');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience added!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Alias for backward compatibility */
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
      const result = await actor.updateExperience(
        data.id,
        data.title,
        data.company,
        data.period,
        data.description,
        data.responsibilities,
      );
      if (!result.success) throw new Error(result.error ?? 'Failed to update experience');
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience updated!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteExperience(id);
      if (!result.success) throw new Error(result.error ?? 'Failed to delete experience');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience deleted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const projects = useGetAllProjectsAdmin();
  const leads = useGetLeads();
  const blogs = useGetBlogPosts();

  return {
    projectCount: projects.data?.length ?? 0,
    leadCount: leads.data?.length ?? 0,
    blogCount: blogs.data?.length ?? 0,
    isLoading: projects.isLoading || leads.isLoading || blogs.isLoading,
  };
}
