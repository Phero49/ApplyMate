import { defineStore } from "pinia";
import { getProfile, type UserProfile, getStats, type Stats } from "src/db";
export interface Resume {
  name: string;
  headline: string;
  contact: Array<{ label: string; value: string }>;
  summary: string;
  skills: Array<{ category: string; skillList: string[] }>;
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  projects?: Array<{
    title: string;
    dates?: string;
    bullets: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    dates?: string;
    bullets?: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date?: string;
    bullets?: string[];
  }>;
  volunteering?: Array<{
    title: string;
    organization: string;
    dates: string;
    bullets: string[];
  }>;
  languages?: Array<{ name: string; level: string }>;
  references?: Array<{
    name: string;
    company: string;
    email: string;
    phone: string;
  }>;
}

export const useAppContext = defineStore("appContext", {
  state: () => ({
    profile: undefined as UserProfile | undefined,
    resume: {
      name: "Pemhero Mkuka",
      headline: "Full Stack Developer | Vue.js & Golang Specialist",
      contact: [
        { label: "Email", value: "pheromkuka49@gmail.com" },
        { label: "Phone", value: "+2659919315" },
        { label: "Location", value: "Lilongwe, Malawi" },
        { label: "GitHub", value: "https://github.com/Phero49" },
        { label: "LinkedIn", value: "https://linkedin.com/in/pheromkuka" },
      ],
      summary:
        "Self-taught Full Stack Developer with 2+ years of experience building web applications from concept to deployment. Proficient in modern frontend frameworks and backend systems. Combines hands-on coding expertise with founder-level ownership to deliver complete, user-focused solutions.",
      skills: [
        {
          category: "Frontend",
          skillList: ["Vue.js", "React.js", "Flutter", "Responsive Design"],
        },
        {
          category: "Backend",
          skillList: ["Golang", "Node.js", "Python", "Dart", "REST APIs"],
        },
        { category: "Database", skillList: ["MySQL", "Firestore", "MongoDB"] },
        {
          category: "Cloud & DevOps",
          skillList: ["Google Cloud Platform (GCP)", "Linux", "Windows"],
        },
      ],
      experience: [
        {
          title: "Full Stack Developer & Co-Founder",
          company: "Xulhub",
          dates: "09/2023 – Present",
          bullets: [
            "Built and launched a full-stack web application from scratch using Vue.js and Golang, serving [X] active users within [6 months].",
            "Architected and managed MongoDB and Firestore databases, reducing query latency by [25%] through optimized indexing.",
            "Deployed and maintained application infrastructure on Google Cloud Platform, achieving [99.5%] uptime.",
            "Led end-to-end product development including frontend UI, backend logic, and database design as a core founder.",
          ],
        },
      ],
      projects: [
        {
          title: "Xulhub – Full Stack Platform",
          dates: "2023 – Present",
          bullets: [
            "Designed and implemented a responsive frontend with Vue.js, improving user engagement by [30%] month-over-month.",
            "Developed scalable backend APIs using Golang, handling [10K+] requests per day with [<200ms] response time.",
            "Integrated authentication, real-time data sync, and cloud storage using Firestore and GCP.",
          ],
        },
      ],
      education: [
        {
          degree:
            "Advanced Diploma in Computing and Information Systems (ABMA)",
          institution: "University of Malawi",
          dates: "01/2021 – 09/2023",
          bullets: [
            "Focused on software development, database systems, and information systems design.",
            "Completed hands-on projects in web and mobile application development.",
          ],
        },
      ],
      certifications: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023",
        },
      ],
      awards: [
        {
          name: "Best Developer Award",
          issuer: "Tech Excellence",
          date: "2023",
          bullets: ["Recognized for outstanding contributions to open source."],
        },
      ],
      volunteering: [
        {
          title: "Community Mentor",
          organization: "Local Tech Youth Program, San Francisco, CA",
          dates: "2018 - 2020",
          bullets: [
            "Mentored high school students in introductory programming and web design.",
          ],
        },
      ],
      languages: [
        { name: "English", level: "Native" },
        { name: "Chichewa", level: "Fluent" },
      ],
      references: [
        {
          name: "John Doe",
          company: "Tech Corp",
          email: "john@example.com",
          phone: "+123456789",
        },
      ],
    },
    stats: undefined as Stats | undefined,
  }),

  getters: {},

  actions: {
    async loadProfile() {
      this.profile = await getProfile();
    },
    async loadStats() {
      this.stats = await getStats();
    },
  },
});
