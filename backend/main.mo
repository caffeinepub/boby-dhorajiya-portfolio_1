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
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    order : Nat;
  };

  public type Project = {
    id : Nat;
    title : Text;
    description : Text;
    url : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    categoryId : ?Nat;
    order : Nat;
    isActive : Bool;
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

  public type Experience = {
    id : Nat;
    title : Text;
    company : Text;
    period : Text;
    description : Text;
    responsibilities : [Text];
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

  public type ExperienceResult = CrudResponse<Experience>;
  public type ExperiencesResult = CrudResponse<[Experience]>;

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
  let experiences = Map.empty<Nat, Experience>();

  var nextTestimonialId = 1;
  var nextBlogPostId = 1;
  var nextProjectId = 1;
  var nextServiceId = 1;
  var nextSkillId = 1;
  var nextLeadId = 1;
  var nextCategoryId = 1;
  var nextSocialLinkId = 1;
  var nextExperienceId = 1;

  var adminPrincipal : ?Principal = null;

  // ── User Profile ──────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Admin claim ───────────────────────────────────────────────────────────

  public shared ({ caller }) func claimAdmin() : async ClaimAdminResult {
    if (caller.isAnonymous()) {
      return #notAuthenticated;
    };
    switch (adminPrincipal) {
      case (?_) { #alreadyClaimed };
      case (null) {
        adminPrincipal := ?caller;
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        #success;
      };
    };
  };

  // ── Testimonials ──────────────────────────────────────────────────────────

  public query func getTestimonials() : async [Testimonial] {
    testimonials.values().toArray();
  };

  public shared ({ caller }) func addTestimonial(author : Text, message : Text) : async Testimonial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add testimonials");
    };
    let id = nextTestimonialId;
    nextTestimonialId += 1;
    let t : Testimonial = { id; author; message };
    testimonials.add(id, t);
    t;
  };

  public shared ({ caller }) func updateTestimonial(id : Nat, author : Text, message : Text) : async ?Testimonial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update testimonials");
    };
    switch (testimonials.get(id)) {
      case (null) { null };
      case (?_) {
        let t : Testimonial = { id; author; message };
        testimonials.add(id, t);
        ?t;
      };
    };
  };

  public shared ({ caller }) func deleteTestimonial(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete testimonials");
    };
    switch (testimonials.get(id)) {
      case (null) { false };
      case (?_) {
        testimonials.remove(id);
        true;
      };
    };
  };

  // ── Blog Posts ────────────────────────────────────────────────────────────

  public query func getBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public query func getBlogPost(id : Nat) : async ?BlogPost {
    blogPosts.get(id);
  };

  public shared ({ caller }) func addBlogPost(
    title : Text,
    slug : Text,
    metaTitle : Text,
    metaDescription : Text,
    content : Text,
  ) : async BlogPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add blog posts");
    };
    let id = nextBlogPostId;
    nextBlogPostId += 1;
    let post : BlogPost = {
      id;
      title;
      slug;
      metaTitle;
      metaDescription;
      content;
      timestamp = Time.now();
    };
    blogPosts.add(id, post);
    post;
  };

  public shared ({ caller }) func updateBlogPost(
    id : Nat,
    title : Text,
    slug : Text,
    metaTitle : Text,
    metaDescription : Text,
    content : Text,
  ) : async ?BlogPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) { null };
      case (?existing) {
        let post : BlogPost = {
          id;
          title;
          slug;
          metaTitle;
          metaDescription;
          content;
          timestamp = existing.timestamp;
        };
        blogPosts.add(id, post);
        ?post;
      };
    };
  };

  public shared ({ caller }) func deleteBlogPost(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) { false };
      case (?_) {
        blogPosts.remove(id);
        true;
      };
    };
  };

  // ── Project Categories ────────────────────────────────────────────────────

  public query func getProjectCategories() : async CategoriesResult {
    let cats = projectCategories.values().toArray();
    { success = true; data = ?cats; error = null };
  };

  public shared ({ caller }) func addProjectCategory(name : Text, slug : Text, order : Nat) : async CategoryResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add project categories");
    };
    let id = nextCategoryId;
    nextCategoryId += 1;
    let cat : ProjectCategory = { id; name; slug; order };
    projectCategories.add(id, cat);
    { success = true; data = ?cat; error = null };
  };

  public shared ({ caller }) func updateProjectCategory(id : Nat, name : Text, slug : Text, order : Nat) : async CategoryResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update project categories");
    };
    switch (projectCategories.get(id)) {
      case (null) { { success = false; data = null; error = ?"Category not found" } };
      case (?_) {
        let cat : ProjectCategory = { id; name; slug; order };
        projectCategories.add(id, cat);
        { success = true; data = ?cat; error = null };
      };
    };
  };

  public shared ({ caller }) func deleteProjectCategory(id : Nat) : async CrudResponse<Bool> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete project categories");
    };
    switch (projectCategories.get(id)) {
      case (null) { { success = false; data = ?false; error = ?"Category not found" } };
      case (?_) {
        projectCategories.remove(id);
        { success = true; data = ?true; error = null };
      };
    };
  };

  // ── Projects ──────────────────────────────────────────────────────────────

  public query func getProjects() : async ProjectsResult {
    let ps = projects.values().toArray();
    { success = true; data = ?ps; error = null };
  };

  public query func getProject(id : Nat) : async ProjectResult {
    switch (projects.get(id)) {
      case (null) { { success = false; data = null; error = ?"Project not found" } };
      case (?p) { { success = true; data = ?p; error = null } };
    };
  };

  public shared ({ caller }) func addProject(
    title : Text,
    description : Text,
    url : Text,
    image : ?Storage.ExternalBlob,
    categoryId : ?Nat,
    order : Nat,
    isActive : Bool,
  ) : async ProjectResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add projects");
    };
    let id = nextProjectId;
    nextProjectId += 1;
    let p : Project = {
      id;
      title;
      description;
      url;
      timestamp = Time.now();
      image;
      categoryId;
      order;
      isActive;
    };
    projects.add(id, p);
    { success = true; data = ?p; error = null };
  };

  public shared ({ caller }) func updateProject(
    id : Nat,
    title : Text,
    description : Text,
    url : Text,
    image : ?Storage.ExternalBlob,
    categoryId : ?Nat,
    order : Nat,
    isActive : Bool,
  ) : async ProjectResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update projects");
    };
    switch (projects.get(id)) {
      case (null) { { success = false; data = null; error = ?"Project not found" } };
      case (?existing) {
        let p : Project = {
          id;
          title;
          description;
          url;
          timestamp = existing.timestamp;
          image;
          categoryId;
          order;
          isActive;
        };
        projects.add(id, p);
        { success = true; data = ?p; error = null };
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async CrudResponse<Bool> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete projects");
    };
    switch (projects.get(id)) {
      case (null) { { success = false; data = ?false; error = ?"Project not found" } };
      case (?_) {
        projects.remove(id);
        { success = true; data = ?true; error = null };
      };
    };
  };

  // Project drag-and-drop reordering
  public shared ({ caller }) func reorderProjects(orderedIds : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reorder projects");
    };
    var index = 0;
    for (id in orderedIds.vals()) {
      switch (projects.get(id)) {
        case (?project) {
          let updatedProject : Project = { project with order = index };
          projects.add(id, updatedProject);
        };
        case (null) {};
      };
      index += 1;
    };
  };

  // ── Services ──────────────────────────────────────────────────────────────

  public query func getServices() : async ServicesResult {
    let ss = services.values().toArray();
    { success = true; data = ?ss; error = null };
  };

  public shared ({ caller }) func addService(title : Text, description : Text) : async ServiceResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    let id = nextServiceId;
    nextServiceId += 1;
    let s : Service = { id; title; description };
    services.add(id, s);
    { success = true; data = ?s; error = null };
  };

  public shared ({ caller }) func updateService(id : Nat, title : Text, description : Text) : async ServiceResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    switch (services.get(id)) {
      case (null) { { success = false; data = null; error = ?"Service not found" } };
      case (?_) {
        let s : Service = { id; title; description };
        services.add(id, s);
        { success = true; data = ?s; error = null };
      };
    };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async CrudResponse<Bool> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    switch (services.get(id)) {
      case (null) { { success = false; data = ?false; error = ?"Service not found" } };
      case (?_) {
        services.remove(id);
        { success = true; data = ?true; error = null };
      };
    };
  };

  // ── Skills ────────────────────────────────────────────────────────────────

  public query func getSkills() : async [Skill] {
    skills.values().toArray();
  };

  public shared ({ caller }) func addSkill(name : Text, experience : Int, category : SkillCategory) : async Skill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add skills");
    };
    let id = nextSkillId;
    nextSkillId += 1;
    let sk : Skill = { id; name; experience; category };
    skills.add(id, sk);
    sk;
  };

  public shared ({ caller }) func updateSkill(id : Nat, name : Text, experience : Int, category : SkillCategory) : async ?Skill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update skills");
    };
    switch (skills.get(id)) {
      case (null) { null };
      case (?_) {
        let sk : Skill = { id; name; experience; category };
        skills.add(id, sk);
        ?sk;
      };
    };
  };

  public shared ({ caller }) func deleteSkill(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete skills");
    };
    switch (skills.get(id)) {
      case (null) { false };
      case (?_) {
        skills.remove(id);
        true;
      };
    };
  };

  // ── Leads ─────────────────────────────────────────────────────────────────

  public query ({ caller }) func getLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view leads");
    };
    leads.values().toArray();
  };

  public shared func submitLead(name : Text, email : Text, message : Text) : async Lead {
    let id = nextLeadId;
    nextLeadId += 1;
    let lead : Lead = { id; name; email; message; timestamp = Time.now() };
    leads.add(id, lead);
    lead;
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    switch (leads.get(id)) {
      case (null) { false };
      case (?_) {
        leads.remove(id);
        true;
      };
    };
  };

  // ── SEO Settings ──────────────────────────────────────────────────────────

  public query func getSeoSettings() : async [SeoSetting] {
    seoSettings.values().toArray();
  };

  public query func getSeoSetting(page : Text) : async ?SeoSetting {
    seoSettings.get(page);
  };

  public shared ({ caller }) func saveSeoSetting(page : Text, metaTitle : Text, metaDescription : Text) : async SeoSetting {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save SEO settings");
    };
    let setting : SeoSetting = { page; metaTitle; metaDescription };
    seoSettings.add(page, setting);
    setting;
  };

  // ── Social Links ──────────────────────────────────────────────────────────

  public query func getSocialLinks() : async [SocialLink] {
    socialLinks.values().toArray();
  };

  public shared ({ caller }) func addSocialLink(platform : SocialPlatform, url : Text, icon : Text, isActive : Bool) : async SocialLink {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add social links");
    };
    let id = nextSocialLinkId;
    nextSocialLinkId += 1;
    let sl : SocialLink = { id; platform; url; icon; isActive };
    socialLinks.add(id, sl);
    sl;
  };

  public shared ({ caller }) func updateSocialLink(id : Nat, platform : SocialPlatform, url : Text, icon : Text, isActive : Bool) : async ?SocialLink {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update social links");
    };
    switch (socialLinks.get(id)) {
      case (null) { null };
      case (?_) {
        let sl : SocialLink = { id; platform; url; icon; isActive };
        socialLinks.add(id, sl);
        ?sl;
      };
    };
  };

  public shared ({ caller }) func deleteSocialLink(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete social links");
    };
    switch (socialLinks.get(id)) {
      case (null) { false };
      case (?_) {
        socialLinks.remove(id);
        true;
      };
    };
  };

  // ── Experiences ───────────────────────────────────────────────────────────

  public query func getExperiences() : async ExperiencesResult {
    let exps = experiences.values().toArray();
    { success = true; data = ?exps; error = null };
  };

  public shared ({ caller }) func addExperience(
    title : Text,
    company : Text,
    period : Text,
    description : Text,
    responsibilities : [Text],
  ) : async ExperienceResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add experiences");
    };
    let id = nextExperienceId;
    nextExperienceId += 1;
    let exp : Experience = { id; title; company; period; description; responsibilities };
    experiences.add(id, exp);
    { success = true; data = ?exp; error = null };
  };

  public shared ({ caller }) func updateExperience(
    id : Nat,
    title : Text,
    company : Text,
    period : Text,
    description : Text,
    responsibilities : [Text],
  ) : async ExperienceResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update experiences");
    };
    switch (experiences.get(id)) {
      case (null) { { success = false; data = null; error = ?"Experience not found" } };
      case (?_) {
        let exp : Experience = { id; title; company; period; description; responsibilities };
        experiences.add(id, exp);
        { success = true; data = ?exp; error = null };
      };
    };
  };

  public shared ({ caller }) func deleteExperience(id : Nat) : async CrudResponse<Bool> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete experiences");
    };
    switch (experiences.get(id)) {
      case (null) { { success = false; data = ?false; error = ?"Experience not found" } };
      case (?_) {
        experiences.remove(id);
        { success = true; data = ?true; error = null };
      };
    };
  };
};
