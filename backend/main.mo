import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Mixin core components
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type Testimonial = {
    id : Nat;
    author : Text;
    message : Text;
  };

  public type BlogPost = {
    id : Nat;
    title : Text;
    slug : Text;
    metaTitle : Text;
    metaDescription : Text;
    content : Text;
    timestamp : Int;
  };

  public type ProjectCategory = {
    id : Nat;
    name : Text;
    slug : Text;
  };

  public type Project = {
    id : Nat;
    title : Text;
    description : Text;
    url : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    categoryId : ?Nat;
  };

  public type Service = {
    id : Nat;
    title : Text;
    description : Text;
  };

  public type SkillCategory = { #primary; #secondary; #security; #additional };

  public type Skill = {
    id : Nat;
    name : Text;
    experience : Int;
    category : SkillCategory;
  };

  public type Lead = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  public type SeoSetting = {
    page : Text;
    metaTitle : Text;
    metaDescription : Text;
  };

  public type SocialPlatform = { #github; #linkedin; #x };

  public type SocialLink = {
    id : Nat;
    platform : SocialPlatform;
    url : Text;
    icon : Text;
    isActive : Bool;
  };

  public type ClaimAdminResult = {
    #success;
    #alreadyClaimed;
    #notAuthenticated;
  };

  public type CrudResponse<T> = {
    success : Bool;
    data : ?T;
    error : ?Text;
  };

  public type CategoryResult = CrudResponse<ProjectCategory>;
  public type CategoriesResult = CrudResponse<[ProjectCategory]>;

  public type ProjectResult = CrudResponse<Project>;
  public type ProjectsResult = CrudResponse<[Project]>;

  public type ServiceResult = CrudResponse<Service>;
  public type ServicesResult = CrudResponse<[Service]>;

  // Data stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let testimonials = Map.empty<Nat, Testimonial>();
  let blogPosts = Map.empty<Nat, BlogPost>();
  let projects = Map.empty<Nat, Project>();
  let services = Map.empty<Nat, Service>();
  let skills = Map.empty<Nat, Skill>();
  let leads = Map.empty<Nat, Lead>();
  let seoSettings = Map.empty<Text, SeoSetting>();
  let projectCategories = Map.empty<Nat, ProjectCategory>();
  let socialLinks = Map.empty<Nat, SocialLink>();

  var nextTestimonialId = 1;
  var nextBlogPostId = 1;
  var nextProjectId = 1;
  var nextServiceId = 1;
  var nextSkillId = 1;
  var nextLeadId = 1;
  var nextCategoryId = 1;
  var nextSocialLinkId = 1;

  var adminPrincipal : ?Principal = null;

  // Returns true and stores adminPrincipal if not set. Once set, returns true only for that principal.
  public shared ({ caller }) func claimAdmin() : async ClaimAdminResult {
    switch (adminPrincipal) {
      case (null) {
        if (caller.isAnonymous()) {
          return #notAuthenticated;
        };
        adminPrincipal := ?caller;
        return #success;
      };
      case (?p) {
        if (caller == p) { #success } else { #alreadyClaimed };
      };
    };
  };

  // Never trap, just return false
  public query ({ caller }) func checkAdminStatus() : async Bool {
    switch (adminPrincipal) {
      case (null) { false };
      case (?p) { caller == p };
    };
  };

  public shared ({ caller }) func resetAdmin() : async () {
    switch (adminPrincipal) {
      case (?p) {
        if (caller != p) {
          Runtime.trap("Unauthorized: Only admin can reset admin status");
        };
        adminPrincipal := null;
      };
      case (null) {
        Runtime.trap("No admin to reset");
      };
    };
  };

  // User profile methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Testimonial CRUD
  // Public read - anyone can view testimonials (portfolio data)
  public query func getTestimonials() : async [Testimonial] {
    testimonials.values().toArray();
  };

  public shared ({ caller }) func addTestimonial(author : Text, message : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can add testimonials");
    };
    let testimonial : Testimonial = { id = nextTestimonialId; author; message };
    testimonials.add(nextTestimonialId, testimonial);
    nextTestimonialId += 1;
  };

  public shared ({ caller }) func updateTestimonial(id : Nat, author : Text, message : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update testimonials");
    };
    switch (testimonials.get(id)) {
      case (null) { Runtime.trap("Testimonial not found") };
      case (?_) {
        let updated : Testimonial = { id; author; message };
        testimonials.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTestimonial(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete testimonials");
    };
    testimonials.remove(id);
  };

  // Blog methods
  // Public read - anyone can view blog posts (portfolio data)
  public query func getBlogs() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public query func getBlogBySlug(slug : Text) : async ?BlogPost {
    blogPosts.values().find(func(blog) { blog.slug == slug });
  };

  public shared ({ caller }) func addBlog(title : Text, slug : Text, metaTitle : Text, metaDescription : Text, content : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can add blogs");
    };
    let blog : BlogPost = {
      id = nextBlogPostId;
      title;
      slug;
      metaTitle;
      metaDescription;
      content;
      timestamp = Time.now();
    };
    blogPosts.add(nextBlogPostId, blog);
    nextBlogPostId += 1;
  };

  public shared ({ caller }) func updateBlog(id : Nat, title : Text, slug : Text, metaTitle : Text, metaDescription : Text, content : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update blogs");
    };
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?_) {
        let updated : BlogPost = {
          id;
          title;
          slug;
          metaTitle;
          metaDescription;
          content;
          timestamp = Time.now();
        };
        blogPosts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteBlog(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete blogs");
    };
    blogPosts.remove(id);
  };

  // Category CRUD Operations
  // Public read - anyone can view categories (portfolio data)
  public query func getCategory(id : Nat) : async CategoryResult {
    switch (projectCategories.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Category not found";
        };
      };
      case (?category) {
        {
          success = true;
          data = ?category;
          error = null;
        };
      };
    };
  };

  public query func listCategories() : async CategoriesResult {
    let categoriesArray = projectCategories.values().toArray();
    {
      success = true;
      data = ?categoriesArray;
      error = null;
    };
  };

  public shared ({ caller }) func createCategory(name : Text, slug : Text) : async CategoryResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can create categories");
    };

    let category : ProjectCategory = { id = nextCategoryId; name; slug };
    projectCategories.add(nextCategoryId, category);
    nextCategoryId += 1;

    {
      success = true;
      data = ?category;
      error = null;
    };
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text, slug : Text) : async CategoryResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update categories");
    };

    switch (projectCategories.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Category not found";
        };
      };
      case (?_) {
        let updated : ProjectCategory = { id; name; slug };
        projectCategories.add(id, updated);
        {
          success = true;
          data = ?updated;
          error = null;
        };
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async CategoryResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete categories");
    };

    switch (projectCategories.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Category not found";
        };
      };
      case (?category) {
        projectCategories.remove(id);
        {
          success = true;
          data = ?category;
          error = null;
        };
      };
    };
  };

  // Project CRUD Operations
  // Public read - anyone can view projects (portfolio data)
  public query func getProjects() : async [Project] {
    projects.values().toArray();
  };

  public query func getProject(id : Nat) : async ProjectResult {
    switch (projects.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Project not found";
        };
      };
      case (?project) {
        {
          success = true;
          data = ?project;
          error = null;
        };
      };
    };
  };

  public query func listProjects() : async ProjectsResult {
    let projectsArray = projects.values().toArray();
    {
      success = true;
      data = ?projectsArray;
      error = null;
    };
  };

  public shared ({ caller }) func createProject(title : Text, description : Text, url : Text, image : ?Storage.ExternalBlob, categoryId : ?Nat) : async ProjectResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can create projects");
    };

    let project : Project = {
      id = nextProjectId;
      title;
      description;
      url;
      image;
      timestamp = Time.now();
      categoryId;
    };
    projects.add(nextProjectId, project);
    nextProjectId += 1;

    {
      success = true;
      data = ?project;
      error = null;
    };
  };

  public shared ({ caller }) func updateProject(id : Nat, title : Text, description : Text, url : Text, image : ?Storage.ExternalBlob, categoryId : ?Nat) : async ProjectResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update projects");
    };

    switch (projects.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Project not found";
        };
      };
      case (?_) {
        let updated : Project = {
          id;
          title;
          description;
          url;
          image;
          timestamp = Time.now();
          categoryId;
        };
        projects.add(id, updated);
        {
          success = true;
          data = ?updated;
          error = null;
        };
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async ProjectResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete projects");
    };

    switch (projects.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Project not found";
        };
      };
      case (?project) {
        projects.remove(id);
        {
          success = true;
          data = ?project;
          error = null;
        };
      };
    };
  };

  // Service CRUD Operations
  // Public read - anyone can view services (portfolio data)
  public query func getService(id : Nat) : async ServiceResult {
    switch (services.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Service not found";
        };
      };
      case (?service) {
        {
          success = true;
          data = ?service;
          error = null;
        };
      };
    };
  };

  public query func listServices() : async ServicesResult {
    let servicesArray = services.values().toArray();
    {
      success = true;
      data = ?servicesArray;
      error = null;
    };
  };

  public shared ({ caller }) func createService(title : Text, description : Text) : async ServiceResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can create services");
    };

    let service : Service = { id = nextServiceId; title; description };
    services.add(nextServiceId, service);
    nextServiceId += 1;

    {
      success = true;
      data = ?service;
      error = null;
    };
  };

  public shared ({ caller }) func updateService(id : Nat, title : Text, description : Text) : async ServiceResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update services");
    };

    switch (services.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Service not found";
        };
      };
      case (?_) {
        let updated : Service = { id; title; description };
        services.add(id, updated);
        {
          success = true;
          data = ?updated;
          error = null;
        };
      };
    };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async ServiceResult {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete services");
    };

    switch (services.get(id)) {
      case (null) {
        {
          success = false;
          data = null;
          error = ?"Service not found";
        };
      };
      case (?service) {
        services.remove(id);
        {
          success = true;
          data = ?service;
          error = null;
        };
      };
    };
  };

  // Skill methods
  // Public read - anyone can view skills (portfolio data)
  public query func listSkills() : async [Skill] {
    skills.values().toArray();
  };

  public shared ({ caller }) func addSkill(name : Text, experience : Int, category : SkillCategory) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can add skills");
    };
    let skill : Skill = { id = nextSkillId; name; experience; category };
    skills.add(nextSkillId, skill);
    nextSkillId += 1;
  };

  public shared ({ caller }) func updateSkill(id : Nat, name : Text, experience : Int, category : SkillCategory) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update skills");
    };
    switch (skills.get(id)) {
      case (null) { Runtime.trap("Skill not found") };
      case (?_) {
        let updated : Skill = { id; name; experience; category };
        skills.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteSkill(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete skills");
    };
    skills.remove(id);
  };

  // Lead (Contact Form) methods
  // Anyone (including guests) can submit a contact form
  public shared func processContactForm(name : Text, email : Text, message : Text) : async () {
    let newLead : Lead = {
      id = nextLeadId;
      name;
      email;
      message;
      timestamp = Time.now();
    };
    leads.add(nextLeadId, newLead);
    nextLeadId += 1;
  };

  public query ({ caller }) func getLeads() : async [Lead] {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can view leads");
    };
    leads.values().toArray();
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete leads");
    };
    leads.remove(id);
  };

  // SEO Setting methods
  // Public read - anyone can view SEO settings (used by frontend for meta tags)
  public query func getSeoSettings() : async [SeoSetting] {
    seoSettings.values().toArray();
  };

  public query func getSeoSettingByPage(page : Text) : async ?SeoSetting {
    seoSettings.get(page);
  };

  public shared ({ caller }) func setSeoSetting(page : Text, metaTitle : Text, metaDescription : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update SEO settings");
    };
    let setting : SeoSetting = { page; metaTitle; metaDescription };
    seoSettings.add(page, setting);
  };

  public shared ({ caller }) func deleteSeoSetting(page : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete SEO settings");
    };
    seoSettings.remove(page);
  };

  // Social Links methods
  // Public read - anyone can view social links (portfolio data)
  public query func listSocialLinks() : async [SocialLink] {
    socialLinks.values().toArray();
  };

  public shared ({ caller }) func createSocialLink(platform : SocialPlatform, url : Text, icon : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can create social links");
    };
    let socialLink : SocialLink = {
      id = nextSocialLinkId;
      platform;
      url;
      icon;
      isActive = true;
    };
    socialLinks.add(nextSocialLinkId, socialLink);
    nextSocialLinkId += 1;
  };

  public shared ({ caller }) func updateSocialLink(id : Nat, url : Text, icon : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update social links");
    };
    switch (socialLinks.get(id)) {
      case (null) { Runtime.trap("Social link not found") };
      case (?link) {
        let updated : SocialLink = { link with url; icon };
        socialLinks.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func toggleSocialLink(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can toggle social links");
    };
    switch (socialLinks.get(id)) {
      case (null) { Runtime.trap("Social link not found") };
      case (?link) {
        let updated : SocialLink = { link with isActive = not link.isActive };
        socialLinks.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteSocialLink(id : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete social links");
    };
    socialLinks.remove(id);
  };

  // Dashboard stats - admin only
  public query ({ caller }) func getDashboardStats() : async { projectCount : Nat; leadCount : Nat; blogCount : Nat } {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can view dashboard stats");
    };
    {
      projectCount = projects.size();
      leadCount = leads.size();
      blogCount = blogPosts.size();
    };
  };

  // Helper Functions
  func isAdmin(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (null) { false };
      case (?admin) { caller == admin };
    };
  };
};
