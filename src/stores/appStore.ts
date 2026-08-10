/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { getProfile, type UserProfile, getStats, type Stats } from "src/db";
// export interface Resume {
//   name: string;
//   headline: string;
//   contact: Array<{ label: string; value: string }>;
//   summary: string;
//   skills: Array<{ category: string; skillList: string[] }>;
//   experience: Array<{
//     title: string;
//     company: string;
//     dates: string;
//     bullets: string[];
//   }>;
//   projects?: Array<{
//     title: string;
//     dates?: string;
//     bullets: string[];
//   }>;
//   education?: Array<{
//     degree: string;
//     institution: string;
//     dates?: string;
//     bullets?: string[];
//   }>;
//   certifications?: Array<{
//     name: string;
//     issuer: string;
//     date?: string;
//   }>;
//   awards?: Array<{
//     name: string;
//     issuer: string;
//     date?: string;
//     description?: string[];
//   }>;
//   volunteering?: Array<{
//     title: string;
//     organization: string;
//     role: string;
//     dates: string;
//     bullets: string[];
//   }>;
//   languages?: Array<{ name: string; level: string }>;
//   references?: Array<{
//     relationship: string;
//     name: string;
//     company: string;
//   contact:string
//   }>;
// }
export type Resume = any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleResume = {
  layout: "vertical",
  style: {
    titleStyle:
      "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:8px;",
    bodyStyle: "font-size:14px; line-height:1.6; color:#374151;",
    headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
    headerRightStyle: "color:#6b7280;",
    subItemStyle: "font-size:14px; color:#4b5563; margin-top:2px;",
    separator: true,
    separatorColor: "#e5e7eb",
  },
  head: {
    name: "[FULL NAME]",
    nameStyle: "font-size:24px; font-weight:bold; color:#111827;",
    headline: "Web Frontend Engineer | Vue.js & TypeScript Specialist",
    headlineStyle: "font-size:16px; color:#4b5563; margin-top:4px;",
    contact: [
      { label: "Phone", value: "[PHONE NUMBER]" },
      { label: "Email", value: "[EMAIL ADDRESS]" },
      { label: "Location", value: "Tokyo, Japan" },
      { label: "LinkedIn", value: "[LINKEDIN URL]" },
    ],
  },
  body: [
    {
      title: "Professional Summary",
      titleStyle:
        "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:4px;",
      items: [
        {
          content:
            "Senior Frontend Engineer with over 7 years of experience architecting and building secure, high-performance web applications for large user bases. Proven ability to lead end-to-end feature development in TypeScript and Vue.js, optimizing performance and driving engineering best practices within agile, product-focused teams. Brings a track record of delivering maintainable, scalable solutions in fast-paced environments, and is eager to apply this expertise to enhance the mobile payments product used by consumers and merchants across Japan.",
          contentStyle: "font-size:14px; line-height:1.6; color:#374151;",
        },
      ],
    },
    {
      title: "Core Competencies",
      titleStyle:
        "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:4px;",
      items: [
        {
          header: ["Frontend"],
          headerStyle: "font-weight:600; font-size:13px; color:#374151;",
          content:
            "Vue.js · TypeScript · JavaScript · Micro-frontends (single-spa) · Web Performance Optimization",
          contentStyle:
            "font-size:14px; color:#4b5563; margin-top:2px; margin-bottom:6px;",
        },
        {
          header: ["DevOps & Observability"],
          headerStyle: "font-weight:600; font-size:13px; color:#374151;",
          content:
            "Docker · Kubernetes · CI/CD (GitHub Actions / Jenkins) · Sentry · Kibana · NewRelic",
          contentStyle:
            "font-size:14px; color:#4b5563; margin-top:2px; margin-bottom:6px;",
        },
        {
          header: ["Testing & Design"],
          headerStyle: "font-weight:600; font-size:13px; color:#374151;",
          content: "Jest · Storybook · Figma",
          contentStyle: "font-size:14px; color:#4b5563; margin-top:2px;",
        },
      ],
    },
    {
      title: "Work Experience",
      titleStyle:
        "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:4px;",
      items: [
        {
          header: [
            "Senior Frontend Engineer",
            "[CURRENT/PREVIOUS COMPANY] · 2022-Present",
          ],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
          content: "Led frontend development for a mobile payments platform",
          contentStyle:
            "font-size:14px; color:#4b5563; margin-top:2px; margin-bottom:4px;",
          subItems: [
            "Architected and implemented a micro-frontend architecture using Vue.js and TypeScript with single-spa, enabling independent deployments for 3 cross-functional teams and reducing build times by 20%.",
            "Led the development of a high-traffic consumer-facing payment feature, collaborating daily with product managers and designers to ensure a secure, pixel-perfect, and responsive user experience, resulting in a 15% increase in user engagement.",
            "Drove a 30% improvement in frontend performance by optimizing asset delivery, implementing code-splitting, and leveraging tools like Lighthouse and NewRelic to identify and resolve bottlenecks.",
            "Championed engineering best practices and code quality by establishing a robust CI/CD pipeline with GitHub Actions and Jenkins, and conducting thorough code reviews that reduced critical bugs by 25%.",
            "Mentored a team of 4 junior engineers, fostering a culture of knowledge sharing, pair programming, and continuous learning, which increased team velocity by 10%.",
          ],
          subItemsStyle: "font-size:14px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
        {
          header: ["Frontend Developer", "[PREVIOUS COMPANY] · 2019-2022"],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
          content: "Built scalable web applications for enterprise clients",
          contentStyle:
            "font-size:14px; color:#4b5563; margin-top:2px; margin-bottom:4px;",
          subItems: [
            "Developed and maintained scalable web applications in React and TypeScript, contributing to a product used by over 2M users, focusing on maintainability and performance.",
            "Collaborated on the design and implementation of a design system using Storybook and Figma, which standardized UI components across 5 projects and reduced development time by 15%.",
            "Instrumented application monitoring with Sentry and Kibana to triage and resolve critical production issues, maintaining a 99.9% uptime and improving user satisfaction.",
            "Redesigned a legacy checkout flow, resulting in a 12% increase in conversion rate through improved UX and streamlined state management.",
          ],
          subItemsStyle: "font-size:14px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
      ],
    },
    {
      title: "Education",
      titleStyle:
        "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:4px;",
      items: [
        {
          header: [
            "Bachelor of Science in Computer Science",
            "[UNIVERSITY NAME] · 2015-2019",
          ],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
          content:
            "Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems.",
          contentStyle: "font-size:14px; color:#4b5563; margin-top:2px;",
        },
      ],
    },
    {
      title: "Certifications",
      titleStyle:
        "font-weight:bold; font-size:16px; color:#1f2937; margin-bottom:4px;",
      items: [
        {
          content:
            "AWS Certified Developer – Associate · Amazon Web Services · [MM/YYYY]",
          contentStyle: "font-size:14px; color:#4b5563;",
        },
        {
          content:
            "Certified Kubernetes Application Developer (CKAD) · Cloud Native Computing Foundation · [MM/YYYY]",
          contentStyle: "font-size:14px; color:#4b5563;",
        },
      ],
    },
  ],
};
const sample2 = {
  layout: "two-column",
  style: {
    titleStyle:
      "font-weight:600; font-size:15px; color:#1f2937; margin-top:12px; margin-bottom:6px;",
    bodyStyle: "font-size:13px; line-height:1.6; color:#374151;",
    headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
    headerRightStyle: "color:#6b7280; font-weight:400;",
    subItemStyle: "font-size:13px; color:#4b5563; margin-top:2px;",
    separator: true,
    separatorColor: "#e5e7eb",
  },
  head: {
    name: "[FULL NAME]",
    nameStyle:
      "font-size:26px; font-weight:700; color:#111827; margin-bottom:2px;",
    headline: "Web Frontend Engineer | Vue.js & TypeScript Specialist",
    headlineStyle: "font-size:16px; color:#4b5563; margin-bottom:8px;",
    contact: [
      { label: "Phone", value: "[PHONE NUMBER]" },
      { label: "Email", value: "[EMAIL ADDRESS]" },
      { label: "Location", value: "Tokyo, Japan" },
      { label: "LinkedIn", value: "[LINKEDIN URL]" },
    ],
    includeContactLabel: false,
  },
  body: [
    {
      side: "main",
      title: "Professional Summary",
      titleStyle:
        "font-weight:700; font-size:15px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          content:
            "Senior Frontend Engineer with over 7 years of experience architecting and building secure, high-performance web applications for large user bases. Proven ability to lead end-to-end feature development in TypeScript and Vue.js, optimizing performance and driving engineering best practices within agile, product-focused teams. Brings a track record of delivering maintainable, scalable solutions in fast-paced environments, and is eager to apply this expertise to enhance the mobile payments product used by consumers and merchants across Japan.",
          contentStyle: "font-size:13px; line-height:1.6; color:#374151;",
        },
      ],
    },
    {
      side: "side",
      title: "Core Competencies",
      titleStyle:
        "font-weight:700; font-size:14px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          content:
            "Vue.js · TypeScript · JavaScript · Micro-frontends (single-spa) · Web Performance Optimization · Docker · Kubernetes · CI/CD (GitHub Actions/Jenkins) · Sentry · Kibana · NewRelic · Jest · Storybook · Figma",
          contentStyle: "font-size:12px; color:#374151; line-height:1.8;",
        },
      ],
    },
    {
      side: "main",
      title: "Work Experience",
      titleStyle:
        "font-weight:700; font-size:15px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          header: ["Senior Frontend Engineer", "[CURRENT/PREVIOUS COMPANY]"],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
          subItems: [
            "Architected and implemented a micro-frontend architecture using Vue.js and TypeScript with single-spa, enabling independent deployments for 3 cross-functional teams and reducing build times by 20%.",
            "Led the development of a high-traffic consumer-facing payment feature, collaborating daily with product managers and designers to ensure a secure, pixel-perfect, and responsive user experience, resulting in a 15% increase in user engagement.",
            "Drove a 30% improvement in frontend performance by optimizing asset delivery, implementing code-splitting, and leveraging tools like Lighthouse and NewRelic to identify and resolve bottlenecks.",
            "Championed engineering best practices and code quality by establishing a robust CI/CD pipeline with GitHub Actions and Jenkins, and conducting thorough code reviews that reduced critical bugs by 25%.",
            "Mentored a team of 4 junior engineers, fostering a culture of knowledge sharing, pair programming, and continuous learning, which increased team velocity by 10%.",
          ],
          subItemsStyle: "font-size:13px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
        {
          header: ["Frontend Developer", "[PREVIOUS COMPANY]"],
          headerAlign: "between",
          headerStyle:
            "font-weight:600; font-size:14px; color:#1f2937; margin-top:12px;",
          subItems: [
            "Developed and maintained scalable web applications in React and TypeScript, contributing to a product used by over 2M users, focusing on maintainability and performance.",
            "Collaborated on the design and implementation of a design system using Storybook and Figma, which standardized UI components across 5 projects and reduced development time by 15%.",
            "Instrumented application monitoring with Sentry and Kibana to triage and resolve critical production issues, maintaining a 99.9% uptime and improving user satisfaction.",
            "Redesigned a legacy checkout flow, resulting in a 12% increase in conversion rate through improved UX and streamlined state management.",
          ],
          subItemsStyle: "font-size:13px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
      ],
    },
    {
      side: "side",
      title: "Education",
      titleStyle:
        "font-weight:700; font-size:14px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          header: [
            "Bachelor of Science in Computer Science",
            "[UNIVERSITY NAME]",
          ],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:13px; color:#1f2937;",
          subItems: [
            "Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems.",
          ],
          subItemsStyle: "font-size:12px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
      ],
    },
    {
      side: "side",
      title: "Certifications",
      titleStyle:
        "font-weight:700; font-size:14px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          header: [
            "AWS Certified Developer – Associate",
            "Amazon Web Services",
          ],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:13px; color:#1f2937;",
        },
        {
          header: [
            "Certified Kubernetes Application Developer (CKAD)",
            "Cloud Native Computing Foundation",
          ],
          headerAlign: "between",
          headerStyle:
            "font-weight:600; font-size:13px; color:#1f2937; margin-top:4px;",
        },
      ],
    },
    {
      side: "main",
      title: "Projects",
      titleStyle:
        "font-weight:700; font-size:15px; color:#1f2937; border-bottom:2px solid #e5e7eb; padding-bottom:4px;",
      items: [
        {
          header: ["Payment Gateway Optimization", "Personal Project"],
          headerAlign: "between",
          headerStyle: "font-weight:600; font-size:14px; color:#1f2937;",
          subItems: [
            "Built a mock payment processing system with Vue.js and TypeScript, handling 10K+ concurrent transactions, reducing latency by 40%.",
            "Implemented CI/CD pipeline with GitHub Actions and deployed to AWS ECS using Docker and Kubernetes.",
          ],
          subItemsStyle: "font-size:13px; color:#4b5563; margin-top:2px;",
          bullet: "•",
        },
      ],
    },
  ],
};
export const useAppContext = defineStore("appContext", {
  state: () => ({
    profile: undefined as UserProfile | undefined,
    resume: sample2 as FlexibleResume,
    aiChatUrl: "",
    resumeFonts: [] as FontsList,
    selectedFont: "" ,
    //used in saving updates of the resume
    resumeData: null as any,
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
