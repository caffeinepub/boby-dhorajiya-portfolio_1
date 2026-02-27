import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SkillCategory, SocialPlatform } from '../backend';
import type {
  Testimonial, BlogPost, Project, Service, Skill, Lead, SeoSetting,
  ProjectCategory, SocialLink, UserProfile, ClaimAdminResult
} from '../backend';

// ─── User Profile ───────────────────────────────────────────────────────────

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] }),
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    // Don't cache stale admin status — always recheck when actor changes
    staleTime: 0,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ClaimAdminResult, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdmin();
    },
    onSuccess: (result) => {
      if (result.__kind__ === 'adminClaimed') {
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      }
    },
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Testimonials ────────────────────────────────────────────────────────────

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ author, message }: { author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTestimonial(author, message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export function useUpdateTestimonial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, author, message }: { id: bigint; author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTestimonial(id, author, message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

// ─── Blog ────────────────────────────────────────────────────────────────────

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; slug: string; metaTitle: string; metaDescription: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlog(data.title, data.slug, data.metaTitle, data.metaDescription, data.content);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useUpdateBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; title: string; slug: string; metaTitle: string; metaDescription: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBlog(data.id, data.title, data.slug, data.metaTitle, data.metaDescription, data.content);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useDeleteBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlog(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; url: string; image: any; categoryId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProject(data.title, data.description, data.url, data.image, data.categoryId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; title: string; description: string; url: string; image: any; categoryId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(data.id, data.title, data.description, data.url, data.image, data.categoryId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<ProjectCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(name, slug);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, slug }: { id: bigint; name: string; slug: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(id, name, slug);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ─── Services ────────────────────────────────────────────────────────────────

export function useGetServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addService(title, description);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, description }: { id: bigint; title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(id, title, description);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export function useGetSkills() {
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

export function useCreateSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, experience, category }: { name: string; experience: bigint; category: SkillCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSkill(name, experience, category);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useUpdateSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, experience, category }: { id: bigint; name: string; experience: bigint; category: SkillCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSkill(id, name, experience, category);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

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

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLead(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useProcessContactForm() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ name, email, message }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processContactForm(name, email, message);
    },
  });
}

// ─── SEO Settings ────────────────────────────────────────────────────────────

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ page, metaTitle, metaDescription }: { page: string; metaTitle: string; metaDescription: string }) => {
      if (!actor) throw new Error('Actor not available');
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (page: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSeoSetting(page);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
    },
  });
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export function useGetSocialLinks() {
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

export function useCreateSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ platform, url, icon }: { platform: SocialPlatform; url: string; icon: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSocialLink(platform, url, icon);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['socialLinks'] }),
  });
}

export function useUpdateSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, url, icon }: { id: bigint; url: string; icon: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSocialLink(id, url, icon);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['socialLinks'] }),
  });
}

export function useToggleSocialLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleSocialLink(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['socialLinks'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['socialLinks'] }),
  });
}
