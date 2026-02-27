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
export type ClaimAdminResult = {
    __kind__: "adminAlreadyExists";
    adminAlreadyExists: Principal;
} | {
    __kind__: "adminClaimed";
    adminClaimed: null;
} | {
    __kind__: "anonymousPrincipal";
    anonymousPrincipal: null;
};
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
export interface Lead {
    id: bigint;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface Skill {
    id: bigint;
    name: string;
    experience: bigint;
    category: SkillCategory;
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
export interface UserProfile {
    name: string;
    email: string;
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
    addProject(title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null): Promise<void>;
    addService(title: string, description: string): Promise<void>;
    addSkill(name: string, experience: bigint, category: SkillCategory): Promise<void>;
    addTestimonial(author: string, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<ClaimAdminResult>;
    createCategory(name: string, slug: string): Promise<void>;
    createSocialLink(platform: SocialPlatform, url: string, icon: string): Promise<void>;
    deleteBlog(id: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteLead(id: bigint): Promise<void>;
    deleteProject(id: bigint): Promise<void>;
    deleteSeoSetting(page: string): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    deleteSkill(id: bigint): Promise<void>;
    deleteSocialLink(id: bigint): Promise<void>;
    deleteTestimonial(id: bigint): Promise<void>;
    getBlogBySlug(slug: string): Promise<BlogPost | null>;
    getBlogs(): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        leadCount: bigint;
        projectCount: bigint;
        blogCount: bigint;
    }>;
    getLeads(): Promise<Array<Lead>>;
    getProjects(): Promise<Array<Project>>;
    getSeoSettingByPage(page: string): Promise<SeoSetting | null>;
    getSeoSettings(): Promise<Array<SeoSetting>>;
    getServices(): Promise<Array<Service>>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<ProjectCategory>>;
    listSkills(): Promise<Array<Skill>>;
    listSocialLinks(): Promise<Array<SocialLink>>;
    processContactForm(name: string, email: string, message: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSeoSetting(page: string, metaTitle: string, metaDescription: string): Promise<void>;
    toggleSocialLink(id: bigint): Promise<void>;
    updateBlog(id: bigint, title: string, slug: string, metaTitle: string, metaDescription: string, content: string): Promise<void>;
    updateCategory(id: bigint, name: string, slug: string): Promise<void>;
    updateProject(id: bigint, title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null): Promise<void>;
    updateService(id: bigint, title: string, description: string): Promise<void>;
    updateSkill(id: bigint, name: string, experience: bigint, category: SkillCategory): Promise<void>;
    updateSocialLink(id: bigint, url: string, icon: string): Promise<void>;
    updateTestimonial(id: bigint, author: string, message: string): Promise<void>;
}
