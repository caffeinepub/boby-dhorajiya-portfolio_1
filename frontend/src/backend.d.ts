import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Testimonial {
    id: bigint;
    author: string;
    message: string;
}
export interface ProjectsResult {
    data?: Array<Project>;
    error?: string;
    success: boolean;
}
export interface Project {
    id: bigint;
    url: string;
    categoryId?: bigint;
    title: string;
    description: string;
    timestamp: bigint;
    image?: ExternalBlob;
}
export interface CategoryResult {
    data?: ProjectCategory;
    error?: string;
    success: boolean;
}
export interface BlogPost {
    id: bigint;
    metaDescription: string;
    title: string;
    content: string;
    slug: string;
    metaTitle: string;
    timestamp: bigint;
}
export interface SocialLink {
    id: bigint;
    url: string;
    icon: string;
    platform: SocialPlatform;
    isActive: boolean;
}
export interface ServicesResult {
    data?: Array<Service>;
    error?: string;
    success: boolean;
}
export interface Service {
    id: bigint;
    title: string;
    description: string;
}
export interface SeoSetting {
    metaDescription: string;
    page: string;
    metaTitle: string;
}
export interface ProjectCategory {
    id: bigint;
    name: string;
    slug: string;
}
export interface CategoriesResult {
    data?: Array<ProjectCategory>;
    error?: string;
    success: boolean;
}
export interface Lead {
    id: bigint;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface ProjectResult {
    data?: Project;
    error?: string;
    success: boolean;
}
export interface Skill {
    id: bigint;
    name: string;
    experience: bigint;
    category: SkillCategory;
}
export interface ServiceResult {
    data?: Service;
    error?: string;
    success: boolean;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum ClaimAdminResult {
    notAuthenticated = "notAuthenticated",
    success = "success",
    alreadyClaimed = "alreadyClaimed"
}
export enum SkillCategory {
    security = "security",
    secondary = "secondary",
    primary = "primary",
    additional = "additional"
}
export enum SocialPlatform {
    x = "x",
    linkedin = "linkedin",
    github = "github"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlog(title: string, slug: string, metaTitle: string, metaDescription: string, content: string): Promise<void>;
    addSkill(name: string, experience: bigint, category: SkillCategory): Promise<void>;
    addTestimonial(author: string, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAdminStatus(): Promise<boolean>;
    claimAdmin(): Promise<ClaimAdminResult>;
    createCategory(name: string, slug: string): Promise<CategoryResult>;
    createProject(title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null): Promise<ProjectResult>;
    createService(title: string, description: string): Promise<ServiceResult>;
    createSocialLink(platform: SocialPlatform, url: string, icon: string): Promise<void>;
    deleteBlog(id: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<CategoryResult>;
    deleteLead(id: bigint): Promise<void>;
    deleteProject(id: bigint): Promise<ProjectResult>;
    deleteSeoSetting(page: string): Promise<void>;
    deleteService(id: bigint): Promise<ServiceResult>;
    deleteSkill(id: bigint): Promise<void>;
    deleteSocialLink(id: bigint): Promise<void>;
    deleteTestimonial(id: bigint): Promise<void>;
    getBlogBySlug(slug: string): Promise<BlogPost | null>;
    getBlogs(): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(id: bigint): Promise<CategoryResult>;
    getDashboardStats(): Promise<{
        leadCount: bigint;
        projectCount: bigint;
        blogCount: bigint;
    }>;
    getLeads(): Promise<Array<Lead>>;
    getProject(id: bigint): Promise<ProjectResult>;
    getProjects(): Promise<Array<Project>>;
    getSeoSettingByPage(page: string): Promise<SeoSetting | null>;
    getSeoSettings(): Promise<Array<SeoSetting>>;
    getService(id: bigint): Promise<ServiceResult>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<CategoriesResult>;
    listProjects(): Promise<ProjectsResult>;
    listServices(): Promise<ServicesResult>;
    listSkills(): Promise<Array<Skill>>;
    listSocialLinks(): Promise<Array<SocialLink>>;
    processContactForm(name: string, email: string, message: string): Promise<void>;
    resetAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSeoSetting(page: string, metaTitle: string, metaDescription: string): Promise<void>;
    toggleSocialLink(id: bigint): Promise<void>;
    updateBlog(id: bigint, title: string, slug: string, metaTitle: string, metaDescription: string, content: string): Promise<void>;
    updateCategory(id: bigint, name: string, slug: string): Promise<CategoryResult>;
    updateProject(id: bigint, title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null): Promise<ProjectResult>;
    updateService(id: bigint, title: string, description: string): Promise<ServiceResult>;
    updateSkill(id: bigint, name: string, experience: bigint, category: SkillCategory): Promise<void>;
    updateSocialLink(id: bigint, url: string, icon: string): Promise<void>;
    updateTestimonial(id: bigint, author: string, message: string): Promise<void>;
}
