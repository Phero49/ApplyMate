/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB, type IDBPDatabase } from "idb";

export interface ProfileLink {
  name: string;
  url: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Project {
  title: string;
  url: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Reference {
  name: string;
  company: string;
  email: string;
  phone: string;
}
export interface Language {
  name: string;
  level: string;
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  links: ProfileLink[];
}

export interface UserProfile {
  id: string; // We'll use 'current' as the single profile id for now
  firstName: string;
  lastName: string;
  contact: Contact;
  summary: string;
  language: Language[];
  experience: Experience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  references: Reference[];
}

export interface ApplicationActivity {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconBg: string; // CSS class or hex
  iconColor: string;
}

export interface SavedLink {
  id: number;
  title: string;
  url: string;
  icon: string;
}

export interface SavedJob {
  id: number;
  title: string;
  url: string;
  icon: string;
  closeDate: string;
  savedAt: string;
  summary: string;
  company: string;
  applied: boolean;
}
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  icon: string;
  color: string;
  time: string;
  read?: boolean;
}

export interface ApplyMateDB extends IDBPDatabase {
  profile: UserProfile;
  activities: ApplicationActivity;
  links: SavedLink;
  notifications: AppNotification;
}

const DB_NAME = "applymate_db";
const DB_VERSION = 5;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profile")) {
        db.createObjectStore("profile", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("links")) {
        const store = db.createObjectStore("links", { keyPath: "url" });
        store.createIndex("url", "url");
      }
      if (!db.objectStoreNames.contains("savedJobs")) {
        const store = db.createObjectStore("savedJobs", { keyPath: "url" });
        store.createIndex("url", "url");
        store.createIndex("title", "title");
        store.createIndex("company", "company");
      }
      if (!db.objectStoreNames.contains("filledForms")) {
        db.createObjectStore("filledForms", { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains("generatedResumes")) {
        db.createObjectStore("generatedResumes", {
          keyPath: "url",
        });
      }
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("fonts")) {
        db.createObjectStore("fonts", { keyPath: "name" });
      }
    },
  });
}

// Profile Actions
export async function saveProfile(profile: UserProfile) {
  const db = await initDB();
  return db.put("profile", { ...profile, id: "current" });
}

export async function getProfile(): Promise<UserProfile | undefined> {
  const db = await initDB();
  return db.get("profile", "current");
}

// Link Actions
export async function addSavedLink(link: Omit<SavedLink, "id">) {
  const db = await initDB();
  return db.put("links", link as any);
}

export async function getSavedLinks(): Promise<SavedLink[]> {
  const db = await initDB();
  return db.getAll("links");
}

export async function deleteSavedLink(id: number) {
  const db = await initDB();
  return db.delete("links", id);
}

// Notification Actions
export async function addNotification(notif: Omit<AppNotification, "id">) {
  const db = await initDB();
  return db.add("notifications", notif as any);
}

export async function getNotifications(): Promise<AppNotification[]> {
  const db = await initDB();
  return db.getAll("notifications");
}

// Saved Job Actions
export async function addSavedJob(job: Omit<SavedJob, "id">) {
  const db = await initDB();
  return db.put("savedJobs", job as any);
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  const db = await initDB();
  const data = await db.getAll("savedJobs");
  const sortedBySaved = data.sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
  return sortedBySaved;
}

export async function deleteSavedJob(url: string) {
  const db = await initDB();
  return db.delete("savedJobs", url);
}

export interface Stats {
  appliedJobs: number;
  savedJobs: number;
  generatedResumes: number;
  savedLinks: number;
  filledForms: number;
  unappliedJobs: number;
}
export async function getStats(): Promise<Stats> {
  const db = await initDB();
  const tx = db.transaction(
    ["savedJobs", "links", "filledForms", "generatedResumes"],
    "readonly",
  );

  const jobsStore = tx.objectStore("savedJobs");
  const linksStore = tx.objectStore("links");
  const formsStore = tx.objectStore("filledForms");
  const resumesStore = tx.objectStore("generatedResumes");

  const linksCount = await linksStore.count();
  const formsCount = await formsStore.count();
  const jobs = await jobsStore.getAll();

  const appliedJobs = jobs.filter((j: any) => j.applied).length;
  const savedJobs = jobs.length;
  const unappliedJobs = savedJobs - appliedJobs;

  const resumes = (await resumesStore.getAll()).filter((r: any) => !r.draft);
  const generatedResumes = resumes.length;

  return {
    appliedJobs,
    savedJobs,
    generatedResumes,
    savedLinks: linksCount,
    filledForms: formsCount,
    unappliedJobs,
  };
}

export async function saveGeneratedResume(resume: any) {
  const db = await initDB();
  return db.put("generatedResumes", {
    ...resume,
    createdAt: new Date().toISOString(),
  });
}



export async function getGeneratedResume(url: string) {
  const db = await initDB();
  const data = await db.get("generatedResumes", url);
  return data;
}

export async function getAllGeneratedResumes() {
  const db = await initDB();
  const data = await db.getAll("generatedResumes");
  return data.map((v) => ({
    url: v.url,
    title: v.title,
    headline: v.resume.headline,
    createdAt: v.createdAt || null,
  }));
}

export interface FontDefinition {
  name: string;
  normal: Blob;
  bold?: Blob;
  italics?: Blob;
  bolditalics?: Blob;
}

export async function saveFont(font: FontDefinition) {
  const db = await initDB();
  return db.put("fonts", font);
}

export async function getFonts(): Promise<FontDefinition[]> {
  const db = await initDB();
  return db.getAll("fonts");
}

export async function getFontAsUrl(name: string) {
  const db = await initDB();
  const font = await db.get("fonts", name);
  if (!font) return null;
  console.log(font);
  return {
    normal: `https://fonts.applyMate.com/${font.normal.name}?font-name=${name}`,
    bold: font.bold
      ? `https://fonts.applyMate.com/${font.bold.name}?font-name=${name}`
      : undefined,
    italics: font.italics
      ? `https://fonts.applyMate.com/${font.italics.name}?font-name=${name}`
      : undefined,
    bolditalics: font.bolditalics
      ? `https://fonts.applyMate.com/${font.bolditalics.name}?font-name=${name}`
      : undefined,
  };
}
export async function getFontData(name: string, file: string) {
  const db = await initDB();
  const font = await db.get("fonts", name);
  if (!font) return null;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const f = (Object.values(font) as File[]).find((v) => v.name === file);
  return f;
}
export async function deleteFont(name: string) {
  const db = await initDB();
  return db.delete("fonts", name);
}
