import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
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
    #adminClaimed;
    #adminAlreadyExists : Principal;
    #anonymousPrincipal;
  };

  // Persistent data stores
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
  var nextCategoryId = 5; // Reserved 1-4 for default categories
  var nextSocialLinkId = 1;

  // Track whether an admin has been initialized yet.
  // Once set to true, claimAdmin will no longer allow new claims.
  var adminInitialized : Bool = false;
  var adminPrincipal : ?Principal = null;

  // claimAdmin: Only the first authenticated caller may claim admin.
  // If an admin already exists, returns #adminAlreadyExists with that principal.
  // Anonymous callers are rejected with #anonymousPrincipal.
  public shared ({ caller }) func claimAdmin() : async ClaimAdminResult {
    if (caller.isAnonymous()) {
      return #anonymousPrincipal;
    };

    if (adminInitialized) {
      // An admin already exists; return that principal
      switch (adminPrincipal) {
        case (?p) { return #adminAlreadyExists(p) };
        case (null) { return #adminAlreadyExists(caller) };
      };
    };

    // No admin has been set yet — initialize the caller as admin (no password needed for first admin)
    AccessControl.initialize(accessControlState, caller, "", "");
    adminInitialized := true;
    adminPrincipal := ?caller;
    return #adminClaimed;
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
  public query func getTestimonials() : async [Testimonial] {
    testimonials.values().toArray();
  };

  public shared ({ caller }) func addTestimonial(author : Text, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add testimonials");
    };
    let testimonial : Testimonial = { id = nextTestimonialId; author; message };
    testimonials.add(nextTestimonialId, testimonial);
    nextTestimonialId += 1;
  };

  public shared ({ caller }) func updateTestimonial(id : Nat, author : Text, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update testimonials");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete testimonials");
    };
    testimonials.remove(id);
  };

  // Blog methods
  public query func getBlogs() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public query func getBlogBySlug(slug : Text) : async ?BlogPost {
    blogPosts.values().find(func(blog) { blog.slug == slug });
  };

  public shared ({ caller }) func addBlog(title : Text, slug : Text, metaTitle : Text, metaDescription : Text, content : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add blogs");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update blogs");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete blogs");
    };
    blogPosts.remove(id);
  };

  // Project-related Methods (Projects and Categories)
  public shared ({ caller }) func addProject(title : Text, description : Text, url : Text, image : ?Storage.ExternalBlob, categoryId : ?Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add projects");
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
  };

  public shared ({ caller }) func updateProject(id : Nat, title : Text, description : Text, url : Text, image : ?Storage.ExternalBlob, categoryId : ?Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update projects");
    };
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
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
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete projects");
    };
    projects.remove(id);
  };

  public query func getProjects() : async [Project] {
    projects.values().toArray();
  };

  public shared ({ caller }) func createCategory(name : Text, slug : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let category : ProjectCategory = { id = nextCategoryId; name; slug };
    projectCategories.add(nextCategoryId, category);
    nextCategoryId += 1;
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text, slug : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (projectCategories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        let updated : ProjectCategory = { id; name; slug };
        projectCategories.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    projectCategories.remove(id);
  };

  public query func listCategories() : async [ProjectCategory] {
    projectCategories.values().toArray();
  };

  // Service methods
  public query func getServices() : async [Service] {
    services.values().toArray();
  };

  public shared ({ caller }) func addService(title : Text, description : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    let service : Service = { id = nextServiceId; title; description };
    services.add(nextServiceId, service);
    nextServiceId += 1;
  };

  public shared ({ caller }) func updateService(id : Nat, title : Text, description : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        let updated : Service = { id; title; description };
        services.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    services.remove(id);
  };

  // Skill methods
  public shared ({ caller }) func addSkill(name : Text, experience : Int, category : SkillCategory) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add skills");
    };
    let skill : Skill = { id = nextSkillId; name; experience; category };
    skills.add(nextSkillId, skill);
    nextSkillId += 1;
  };

  public shared ({ caller }) func updateSkill(id : Nat, name : Text, experience : Int, category : SkillCategory) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update skills");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete skills");
    };
    skills.remove(id);
  };

  public query func listSkills() : async [Skill] {
    skills.values().toArray();
  };

  // Lead (Contact Form) methods
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view leads");
    };
    leads.values().toArray();
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    leads.remove(id);
  };

  // SEO Setting methods
  public query func getSeoSettings() : async [SeoSetting] {
    seoSettings.values().toArray();
  };

  public query func getSeoSettingByPage(page : Text) : async ?SeoSetting {
    seoSettings.get(page);
  };

  public shared ({ caller }) func setSeoSetting(page : Text, metaTitle : Text, metaDescription : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update SEO settings");
    };
    let setting : SeoSetting = { page; metaTitle; metaDescription };
    seoSettings.add(page, setting);
  };

  public shared ({ caller }) func deleteSeoSetting(page : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete SEO settings");
    };
    seoSettings.remove(page);
  };

  // Social Links methods
  public shared ({ caller }) func createSocialLink(platform : SocialPlatform, url : Text, icon : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create social links");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update social links");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can toggle social links");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete social links");
    };
    socialLinks.remove(id);
  };

  public query func listSocialLinks() : async [SocialLink] {
    socialLinks.values().toArray();
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async { projectCount : Nat; leadCount : Nat; blogCount : Nat } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };
    {
      projectCount = projects.size();
      leadCount = leads.size();
      blogCount = blogPosts.size();
    };
  };
};
