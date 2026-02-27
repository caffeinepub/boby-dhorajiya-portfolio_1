import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Project, BlogPost, Service, Skill, Testimonial, Lead, SeoSetting, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

// ─── Projects ───────────────────────────────────────────────────────────────

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

export function useProjectMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addProject = useMutation({
    mutationFn: async ({ title, description, url, image }: { title: string; description: string; url: string; image: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProject(title, description, url, image);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, title, description, url, image }: { id: bigint; title: string; description: string; url: string; image: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProject(id, title, description, url, image);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return { addProject, updateProject, deleteProject };
}

// ─── Blogs ───────────────────────────────────────────────────────────────────

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

export function useBlogMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addBlog = useMutation({
    mutationFn: async ({ title, slug, metaTitle, metaDescription, content }: { title: string; slug: string; metaTitle: string; metaDescription: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlog(title, slug, metaTitle, metaDescription, content);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });

  const updateBlog = useMutation({
    mutationFn: async ({ id, title, slug, metaTitle, metaDescription, content }: { id: bigint; title: string; slug: string; metaTitle: string; metaDescription: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBlog(id, title, slug, metaTitle, metaDescription, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog'] });
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlog(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });

  return { addBlog, updateBlog, deleteBlog };
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

export function useServiceMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addService = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addService(title, description);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, title, description }: { id: bigint; title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(id, title, description);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteService(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  return { addService, updateService, deleteService };
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export function useGetSkills() {
  const { actor, isFetching } = useActor();
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSkills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSkillMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addSkill = useMutation({
    mutationFn: async ({ name, experience }: { name: string; experience: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSkill(name, experience);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  const updateSkill = useMutation({
    mutationFn: async ({ id, name, experience }: { id: bigint; name: string; experience: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSkill(id, name, experience);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSkill(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  });

  return { addSkill, updateSkill, deleteSkill };
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

export function useTestimonialMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const addTestimonial = useMutation({
    mutationFn: async ({ author, message }: { author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTestimonial(author, message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, author, message }: { id: bigint; author: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTestimonial(id, author, message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTestimonial(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });

  return { addTestimonial, updateTestimonial, deleteTestimonial };
}

// ─── Leads ───────────────────────────────────────────────────────────────────

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

export function useContactForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, message }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processContactForm(name, email, message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useLeadMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const deleteLead = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLead(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  return { deleteLead };
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

export function useGetSeoByPage(page: string) {
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

export function useSeoMutations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const setSeoSetting = useMutation({
    mutationFn: async ({ page, metaTitle, metaDescription }: { page: string; metaTitle: string; metaDescription: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setSeoSetting(page, metaTitle, metaDescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
    },
  });

  const deleteSeoSetting = useMutation({
    mutationFn: async (page: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSeoSetting(page);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
      queryClient.invalidateQueries({ queryKey: ['seoSetting'] });
    },
  });

  return { setSeoSetting, deleteSeoSetting };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{ leadCount: bigint; projectCount: bigint; blogCount: bigint }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

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
