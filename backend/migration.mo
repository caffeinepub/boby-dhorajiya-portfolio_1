import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";

module {
  type UserProfile = {
    name : Text;
    email : Text;
  };

  type Testimonial = {
    id : Nat;
    author : Text;
    message : Text;
  };

  type BlogPost = {
    id : Nat;
    title : Text;
    slug : Text;
    metaTitle : Text;
    metaDescription : Text;
    content : Text;
    timestamp : Int;
  };

  type ProjectCategory = {
    id : Nat;
    name : Text;
    slug : Text;
    order : Nat;
  };

  type Project = {
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

  type Service = {
    id : Nat;
    title : Text;
    description : Text;
  };

  type SkillCategory = { #primary; #secondary; #security; #additional };

  type Skill = {
    id : Nat;
    name : Text;
    experience : Int;
    category : SkillCategory;
  };

  type Lead = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  type SeoSetting = {
    page : Text;
    metaTitle : Text;
    metaDescription : Text;
  };

  type SocialPlatform = { #github; #linkedin; #x };

  type SocialLink = {
    id : Nat;
    platform : SocialPlatform;
    url : Text;
    icon : Text;
    isActive : Bool;
  };

  type Experience = {
    id : Nat;
    title : Text;
    company : Text;
    period : Text;
    description : Text;
    responsibilities : [Text];
  };

  type Actor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    testimonials : Map.Map<Nat, Testimonial>;
    blogPosts : Map.Map<Nat, BlogPost>;
    projects : Map.Map<Nat, Project>;
    services : Map.Map<Nat, Service>;
    skills : Map.Map<Nat, Skill>;
    leads : Map.Map<Nat, Lead>;
    seoSettings : Map.Map<Text, SeoSetting>;
    projectCategories : Map.Map<Nat, ProjectCategory>;
    socialLinks : Map.Map<Nat, SocialLink>;
    experiences : Map.Map<Nat, Experience>;
    nextTestimonialId : Nat;
    nextBlogPostId : Nat;
    nextProjectId : Nat;
    nextServiceId : Nat;
    nextSkillId : Nat;
    nextLeadId : Nat;
    nextCategoryId : Nat;
    nextSocialLinkId : Nat;
    nextExperienceId : Nat;
    adminPrincipal : ?Principal;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
