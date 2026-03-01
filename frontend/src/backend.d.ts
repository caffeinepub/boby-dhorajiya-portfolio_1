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
export interface ProjectsResult {
    data?: Array<Project>;
    error?: string;
    success: boolean;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface CategoryResult {
    data?: ProjectCategory;
    error?: string;
    success: boolean;
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
export interface ProjectCategory {
    id: bigint;
    order: bigint;
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
export interface ProjectResult {
    data?: Project;
    error?: string;
    success: boolean;
}
export interface ExperiencesResult {
    data?: Array<Experience>;
    error?: string;
    success: boolean;
}
export interface ServiceResult {
    data?: Service;
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
export interface Service {
    id: bigint;
    title: string;
    description: string;
}
export interface CategoriesResult {
    data?: Array<ProjectCategory>;
    error?: string;
    success: boolean;
}
export interface SeoSetting {
    metaDescription: string;
    page: string;
    metaTitle: string;
}
export interface CrudResponse {
    data?: boolean;
    error?: string;
    success: boolean;
}
export interface Skill {
    id: bigint;
    name: string;
    experience: bigint;
    category: SkillCategory;
}
export interface Experience {
    id: bigint;
    title: string;
    responsibilities: Array<string>;
    period: string;
    description: string;
    company: string;
}
export interface ExperienceResult {
    data?: Experience;
    error?: string;
    success: boolean;
}
export interface Project {
    id: bigint;
    url: string;
    categoryId?: bigint;
    title: string;
    order: bigint;
    description: string;
    isActive: boolean;
    timestamp: bigint;
    image?: ExternalBlob;
}
export interface Testimonial {
    id: bigint;
    author: string;
    message: string;
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
    addBlogPost(title: string, slug: string, metaTitle: string, metaDescription: string, content: string): Promise<BlogPost>;
    addExperience(title: string, company: string, period: string, description: string, responsibilities: Array<string>): Promise<ExperienceResult>;
    addProject(title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null, order: bigint, isActive: boolean): Promise<ProjectResult>;
    addProjectCategory(name: string, slug: string, order: bigint): Promise<CategoryResult>;
    addService(title: string, description: string): Promise<ServiceResult>;
    addSkill(name: string, experience: bigint, category: SkillCategory): Promise<Skill>;
    addSocialLink(platform: SocialPlatform, url: string, icon: string, isActive: boolean): Promise<SocialLink>;
    addTestimonial(author: string, message: string): Promise<Testimonial>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<ClaimAdminResult>;
    deleteBlogPost(id: bigint): Promise<boolean>;
    deleteExperience(id: bigint): Promise<CrudResponse>;
    deleteLead(id: bigint): Promise<boolean>;
    deleteProject(id: bigint): Promise<CrudResponse>;
    deleteProjectCategory(id: bigint): Promise<CrudResponse>;
    deleteService(id: bigint): Promise<CrudResponse>;
    deleteSkill(id: bigint): Promise<boolean>;
    deleteSocialLink(id: bigint): Promise<boolean>;
    deleteTestimonial(id: bigint): Promise<boolean>;
    getBlogPost(id: bigint): Promise<BlogPost | null>;
    getBlogPosts(): Promise<Array<BlogPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperiences(): Promise<ExperiencesResult>;
    getLeads(): Promise<Array<Lead>>;
    getProject(id: bigint): Promise<ProjectResult>;
    getProjectCategories(): Promise<CategoriesResult>;
    getProjects(): Promise<ProjectsResult>;
    getSeoSetting(page: string): Promise<SeoSetting | null>;
    getSeoSettings(): Promise<Array<SeoSetting>>;
    getServices(): Promise<ServicesResult>;
    getSkills(): Promise<Array<Skill>>;
    getSocialLinks(): Promise<Array<SocialLink>>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderProjects(orderedIds: Array<bigint>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSeoSetting(page: string, metaTitle: string, metaDescription: string): Promise<SeoSetting>;
    submitLead(name: string, email: string, message: string): Promise<Lead>;
    updateBlogPost(id: bigint, title: string, slug: string, metaTitle: string, metaDescription: string, content: string): Promise<BlogPost | null>;
    updateExperience(id: bigint, title: string, company: string, period: string, description: string, responsibilities: Array<string>): Promise<ExperienceResult>;
    updateProject(id: bigint, title: string, description: string, url: string, image: ExternalBlob | null, categoryId: bigint | null, order: bigint, isActive: boolean): Promise<ProjectResult>;
    updateProjectCategory(id: bigint, name: string, slug: string, order: bigint): Promise<CategoryResult>;
    updateService(id: bigint, title: string, description: string): Promise<ServiceResult>;
    updateSkill(id: bigint, name: string, experience: bigint, category: SkillCategory): Promise<Skill | null>;
    updateSocialLink(id: bigint, platform: SocialPlatform, url: string, icon: string, isActive: boolean): Promise<SocialLink | null>;
    updateTestimonial(id: bigint, author: string, message: string): Promise<Testimonial | null>;
}
