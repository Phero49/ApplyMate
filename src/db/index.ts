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

export interface UserProfile {
  id: string; // We'll use 'current' as the single profile id for now
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  links: ProfileLink[];
  summary: string;
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
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profile")) {
        db.createObjectStore("profile", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("activities")) {
        db.createObjectStore("activities", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("links")) {
        db.createObjectStore("links", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", {
          keyPath: "id",
          autoIncrement: true,
        });
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

// Activity Actions
export async function addActivity(activity: Omit<ApplicationActivity, "id">) {
  const db = await initDB();
  return db.add("activities", activity as any);
}

export async function getActivities(): Promise<ApplicationActivity[]> {
  const db = await initDB();
  return db.getAll("activities");
}

// Link Actions
export async function addSavedLink(link: Omit<SavedLink, "id">) {
  const db = await initDB();
  return db.add("links", link as any);
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
  return db.add("savedJobs", job as any);
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  const db = await initDB();
  return db.getAll("savedJobs");
}

export async function deleteSavedJob(id: number) {
  const db = await initDB();
  return db.delete("savedJobs", id);
}
