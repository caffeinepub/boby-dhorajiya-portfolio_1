import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Skill,
  SkillCategory,
  Project,
  Service,
  BlogPost,
  Testimonial,
  Lead,
  SeoSetting,
  SocialLink,
  SocialPlatform,
  ProjectCategory,
  UserProfile,
  ClaimAdminResult,
} from '../backend';
import { ExternalBlob } from '../backend';

// ─── Auth / Admin ────────────────────────────────────────────────────────────

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation<ClaimAdminResult, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin', principalStr] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.checkAdminStatus();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
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

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export function useListSkills() {
  const { actor, isFetching } = useActor();

  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSkills();
    },
    enabled: !!actor && !isFetching,
  });
}

/** @alias useListSkills — kept for backward compatibility */
export const useGetSkills = useListSkills;

export function useCreateSkill() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { name: string; experience: bigint; category: SkillCategory }>({
    mutationFn: async ({ name, experience, category }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.addSkill(name, experience, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useUpdateSkill() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; name: string; experience: bigint; category: SkillCategory }>({
    mutationFn: async ({ id, name, experience, category }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.updateSkill(id, name, experience, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteSkill(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function useGetProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { title: string; description: string; url: string; image: ExternalBlob | null; categoryId: bigint | null }
  >({
    mutationFn: async ({ title, description, url, image, categoryId }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.createProject(title, description, url, image, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: bigint; title: string; description: string; url: string; image: ExternalBlob | null; categoryId: bigint | null }
  >({
    mutationFn: async ({ id, title, description, url, image, categoryId }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.updateProject(id, title, description, url, image, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function useListServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listServices();
      return result.data ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

/** @alias useListServices — kept for backward compatibility */
export const useGetServices = useListServices;

export function useAddService() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { title: string; description: string }>({
    mutationFn: async ({ title, description }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.createService(title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; title: string; description: string }>({
    mutationFn: async ({ id, title, description }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.updateService(id, title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export function useGetBlogs() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['blogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBlogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlogBySlug(slug: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost | null>({
    queryKey: ['blog', slug],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBlogBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useAddBlog() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { title: string; slug: string; metaTitle: string; metaDescription: string; content: string }
  >({
    mutationFn: async ({ title, slug, metaTitle, metaDescription, content }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.addBlog(title, slug, metaTitle, metaDescription, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useUpdateBlog() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: bigint; title: string; slug: string; metaTitle: string; metaDescription: string; content: string }
  >({
    mutationFn: async ({ id, title, slug, metaTitle, metaDescription, content }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.updateBlog(id, title, slug, metaTitle, metaDescription, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useDeleteBlog() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteBlog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export function useGetTestimonials() {
  const { actor, isFetching } = useActor();

  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestimonials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTestimonial() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { author: string; message: string }>({
    mutationFn: async ({ author, message }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.addTestimonial(author, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; author: string; message: string }>({
    mutationFn: async ({ id, author, message }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.updateTestimonial(id, author, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteTestimonial(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function useGetLeads() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeads();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useProcessContactForm() {
  const { actor } = useActor();

  return useMutation<void, Error, { name: string; email: string; message: string }>({
    mutationFn: async ({ name, email, message }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processContactForm(name, email, message);
    },
  });
}

// ─── SEO Settings ─────────────────────────────────────────────────────────────

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
      return actor.getSeoSettingByPage(page);
    },
    enabled: !!actor && !isFetching && !!page,
  });
}

export function useSetSeoSetting() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { page: string; metaTitle: string; metaDescription: string }>({
    mutationFn: async ({ page, metaTitle, metaDescription }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.setSeoSetting(page, metaTitle, metaDescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
    },
  });
}

export function useDeleteSeoSetting() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (page) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteSeoSetting(page);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
    },
  });
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export function useListSocialLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<SocialLink[]>({
    queryKey: ['socialLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSocialLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

/** @alias useListSocialLinks — kept for backward compatibility */
export const useGetSocialLinks = useListSocialLinks;

export function useCreateSocialLink() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { platform: SocialPlatform; url: string; icon: string }>({
    mutationFn: async ({ platform, url, icon }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.createSocialLink(platform, url, icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useUpdateSocialLink() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; url: string; icon: string }>({
    mutationFn: async ({ id, url, icon }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.updateSocialLink(id, url, icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useToggleSocialLink() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.toggleSocialLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

export function useDeleteSocialLink() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      return actor.deleteSocialLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useListCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<ProjectCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listCategories();
      return result.data ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

/** @alias useListCategories — kept for backward compatibility */
export const useGetCategories = useListCategories;

export function useCreateCategory() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { name: string; slug: string }>({
    mutationFn: async ({ name, slug }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.createCategory(name, slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; name: string; slug: string }>({
    mutationFn: async ({ id, name, slug }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.updateCategory(id, name, slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      await actor.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<{ leadCount: bigint; projectCount: bigint; blogCount: bigint }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
