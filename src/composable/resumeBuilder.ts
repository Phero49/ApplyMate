import { biLayoutSidebar, biSquare } from "@quasar/extras/bootstrap-icons";
import { reactive, ref } from "vue";
import pdfMake from "pdfmake";
import { useAppContext } from "src/stores/appStore";
import type {
  TDocumentDefinitions,
  Content,
  TFontFamilyTypes,
} from "pdfmake/interfaces";
import { getFontAsUrl } from "src/db";
import { useDomStore } from "src/stores/dom";

interface Layout {
  icon: string;
  name: "vertical" | "two-column";
  columnSide?: "left" | "right";
}

export const availableLayouts = reactive<Layout[]>([
  {
    icon: biSquare,
    name: "vertical",
  },
  {
    name: "two columns",
    icon: biLayoutSidebar,
    columnSide: "left",
  },
]);
const appStore = useAppContext();






const domStore = useDomStore();

function getPdfStyle(itemName: string) {
  const css = domStore.styles[itemName] || {};
  const pdfStyle: Record<string, string | boolean | number> = {};
  if (css.fontWeight === "bold") pdfStyle.bold = true;
  if (css.fontStyle === "italic") pdfStyle.italics = true;
  if (css.textDecoration === "underline") pdfStyle.decoration = "underline";
  if (css.color) pdfStyle.color = css.color;
  if (css.textAlign) pdfStyle.alignment = css.textAlign;
  if (css.fontSize) {
    pdfStyle.fontSize = parseInt(css.fontSize as string);
  }
  return pdfStyle;
}

// Page constants (A4, default 40pt margins on each side -> 515.28pt usable width)
const PAGE_CONTENT_WIDTH = 515.28;
const COLUMN_GAP = 24;
const SIDEBAR_RATIO = 0.32; // sidebar takes ~32% of the content width

// Vertical rhythm. Bump these up/down together to make the whole
// document feel airier or denser without hunting through every render fn.
const SPACING = {
  afterHeaderBlock: 18, // below name/headline
  beforeSectionHeader: 20, // above each new section title
  afterSectionHeaderRule: 14, // below the divider line, before section content
  betweenEntries: 14, // gap between e.g. two experience/education items
  afterEntryTitleRow: 4, // between title/dates row and the line below it (company, institution)
  beforeBullets: 6,
  afterBullets: 12,
  lineHeight: 1.35,
};

export async function exportPdf() {
  const resume = appStore.resume;
  const docDefinition: TDocumentDefinitions = {
    defaultStyle: {
      font: "Arial",
      fontSize: 10,
      lineHeight: SPACING.lineHeight,
    },
    styles: {
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, SPACING.beforeSectionHeader, 0, 6],
      },
    },
    pageMargins: [42, 42, 42, 42],
    content: [],
  };
  const fonts = await getFontAsUrl("Arial");
  pdfMake.fonts = {
    Arial: fonts as TFontFamilyTypes,
  };

  const content = docDefinition.content as Content[];

  // Helper for Section Headers. `width` lets the divider line match
  // whichever column (full page, sidebar, or main) it's rendered into.
  const addSectionHeader = (
    label: string,
    itemName: string,
    target: Content[],
    width: number = PAGE_CONTENT_WIDTH,
  ) => {
    target.push({
      text: label,
      style: ["sectionHeader", getPdfStyle(itemName)],
    });
    target.push({
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: width,
          y2: 0,
          lineWidth: 1,
          lineColor: domStore.primaryColor || "#000000",
        },
      ],
      margin: [0, 0, 0, SPACING.afterSectionHeaderRule],
    });
  };

  const renderHeader = (target: Content[]) => {
    target.push({
      text: resume.name,
      style: { fontSize: 24, bold: true, ...getPdfStyle("name") },
      margin: [0, 0, 0, 4],
    });
    target.push({
      text: resume.headline,
      style: { fontSize: 12, ...getPdfStyle("headline") },
      margin: [0, 0, 0, SPACING.afterHeaderBlock],
    });
  };

  const renderContact = (target: Content[], width: number) => {
    if (!resume.contact) return;
    addSectionHeader("Contact", "contact-header", target, width);
    type ContactLineItem = {
      text: string;
      margin: [number, number, number, number];
      alignment: "left" | "right" | "center";
      bold: boolean;
    };

    const contactLine: ContactLineItem[] = [];
    const inlineDisplay =
      domStore.styles["contact"]?.display === "inline" || true;
    // const alignment = (domStore.styles["contact"]?.alignment || "left") as
    //   | "left"
    //   | "right"
    //   | "center";
    const includeLabels = domStore.styles["contact"]?.includeLabels || false;
    resume.contact.forEach((c) => {
      contactLine.push({
        text: `${includeLabels ? c.label + ":" : ""} ${c.value}`,
        margin: [0, 0, 10, 0],
        alignment: "left",
        bold: true,
      });
    });
    if (inlineDisplay) {
      target.push({
        columns: contactLine as unknown as Content[],
      });
    } else {
      // stacked (one per line) when not inline
      contactLine.forEach((c, i) =>
        target.push({
          ...c,
          margin: [
            0,
            0,
            0,
            i === contactLine.length - 1 ? SPACING.betweenEntries : 4,
          ],
        }),
      );
    }
    console.log(contactLine, "contact");
  };

  const renderSummary = (target: Content[], width: number) => {
    if (!resume.summary) return;
    addSectionHeader("Professional Summary", "summary-header", target, width);
    target.push({
      text: resume.summary,
      margin: [0, 0, 0, SPACING.betweenEntries],
      ...getPdfStyle("summary"),
    });
  };

  const renderExperience = (target: Content[], width: number) => {
    if (!resume.experience) return;
    addSectionHeader("Experience", "experience-header", target, width);
    resume.experience.forEach((exp, i) => {
      target.push({
        columns: [
          {
            text: exp.title,
            bold: true,
            ...getPdfStyle(`experience.${i}.title`),
          },
          {
            text: exp.dates,
            alignment: "right",
            ...getPdfStyle(`experience.${i}.dates`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      target.push({
        text: exp.company,
        italics: true,
        ...getPdfStyle(`experience.${i}.company`),
      });
      target.push({
        ul: exp.bullets.map((b, j) => ({
          text: b,
          margin: [0, 0, 0, 4],
          ...getPdfStyle(`experience.${i}.bullets.${j}`),
        })),
        margin: [0, SPACING.beforeBullets, 0, SPACING.afterBullets],
      });
    });
  };

  const renderEducation = (target: Content[], width: number) => {
    if (!resume.education) return;
    addSectionHeader("Education", "education-header", target, width);
    resume.education.forEach((edu, i) => {
      target.push({
        columns: [
          {
            text: edu.degree ?? "",
            bold: true,
            ...getPdfStyle(`education.${i}.degree`),
          },
          {
            text: edu.dates ?? "",
            alignment: "right",
            ...getPdfStyle(`education.${i}.dates`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      target.push({
        text: edu.institution,
        italics: true,
        margin: [0, 0, 0, edu.bullets ? 0 : SPACING.betweenEntries],
        ...getPdfStyle(`education.${i}.institution`),
      });
      if (edu.bullets) {
        target.push({
          ul: edu.bullets.map((b, j) => ({
            text: b,
            margin: [0, 0, 0, 4],
            ...getPdfStyle(`education.${i}.bullets.${j}`),
          })),
          margin: [0, SPACING.beforeBullets, 0, SPACING.afterBullets],
        });
      }
    });
  };

  const renderSkills = (target: Content[], width: number) => {
    if (!resume.skills) return;
    addSectionHeader("Skills", "skills-header", target, width);
    resume.skills.forEach((group, i) => {
      target.push({
        text: group.category,
        bold: true,
        ...getPdfStyle(`skills.${i}.category`),
        margin: [0, i === 0 ? 0 : SPACING.betweenEntries, 0, 4],
      });
      target.push({
        text: group.skillList.join(", "),
        margin: [0, 0, 0, 0],
      });
    });
  };

  // --- Newly wired-up sections (field names are best-guess placeholders —
  // adjust to match your actual resume data shape) ---

  const renderCertifications = (target: Content[], width: number) => {
    if (!resume.certifications) return;
    addSectionHeader("Certifications", "certifications-header", target, width);
    resume.certifications.forEach((cert, i) => {
      target.push({
        columns: [
          {
            text: cert.name,
            bold: true,
            ...getPdfStyle(`certifications.${i}.name`),
          },
          {
            text: cert.date ?? "",
            alignment: "right",
            ...getPdfStyle(`certifications.${i}.date`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      if (cert.issuer) {
        target.push({
          text: cert.issuer,
          italics: true,
          margin: [0, 0, 0, 0],
          ...getPdfStyle(`certifications.${i}.issuer`),
        });
      }
    });
  };

  const renderProjects = (target: Content[], width: number) => {
    if (!resume.projects) return;
    addSectionHeader("Projects", "projects-header", target, width);
    resume.projects.forEach((proj, i) => {
      target.push({
        columns: [
          {
            text: proj.title,
            bold: true,
            ...getPdfStyle(`projects.${i}.title`),
          },
          {
            text: proj.dates ?? "",
            alignment: "right",
            ...getPdfStyle(`projects.${i}.dates`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      // if (proj.description) {
      //   target.push({
      //     text: proj.description,
      //     margin: [
      //       0,
      //       0,
      //       0,
      //       proj.bullets ? SPACING.beforeBullets : SPACING.betweenEntries,
      //     ],
      //     ...getPdfStyle(`projects.${i}.description`),
      //   });
      // }
      if (proj.bullets) {
        target.push({
          ul: proj.bullets.map((b, j) => ({
            text: b,
            margin: [0, 0, 0, 4],
            ...getPdfStyle(`projects.${i}.bullets.${j}`),
          })),
          margin: [0, 0, 0, SPACING.afterBullets],
        });
      }
    });
  };

  const renderAwards = (target: Content[], width: number) => {
    if (!resume.awards) return;
    addSectionHeader("Awards", "awards-header", target, width);
    resume.awards.forEach((award, i) => {
      target.push({
        columns: [
          {
            text: award.name,
            bold: true,
            ...getPdfStyle(`awards.${i}.title`),
          },
          {
            text: award.date ?? "",
            alignment: "right",
            ...getPdfStyle(`awards.${i}.date`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      if (award.issuer) {
        target.push({
          text: award.issuer,
          italics: true,
          margin: [0, 0, 0, award.description ? 2 : SPACING.betweenEntries],
          ...getPdfStyle(`awards.${i}.issuer`),
        });
      }
      if (award.description) {
        target.push({
          text: award.description,
          margin: [0, 0, 0, SPACING.betweenEntries],
          ...getPdfStyle(`awards.${i}.description`),
        });
      }
    });
  };

  const renderLanguages = (target: Content[], width: number) => {
    if (!resume.languages) return;
    addSectionHeader("Languages", "languages-header", target, width);
    resume.languages.forEach((lang, i) => {
      target.push({
        text: lang.level ? `${lang.level} — ${lang.level}` : lang.level,
        margin: [0, 0, 0, 6],
        ...getPdfStyle(`languages.${i}`),
      });
    });
  };

  const renderVolunteering = (target: Content[], width: number) => {
    if (!resume.volunteering) return;
    addSectionHeader("Volunteering", "volunteering-header", target, width);
    resume.volunteering.forEach((vol, i) => {
      target.push({
        columns: [
          {
            text: vol.role,
            bold: true,
            ...getPdfStyle(`volunteering.${i}.role`),
          },
          {
            text: vol.dates ?? "",
            alignment: "right",
            ...getPdfStyle(`volunteering.${i}.dates`),
          },
        ],
        margin: [
          0,
          i === 0 ? 0 : SPACING.betweenEntries,
          0,
          SPACING.afterEntryTitleRow,
        ],
      });
      target.push({
        text: vol.organization,
        italics: true,
        margin: [0, 0, 0, vol.bullets ? 0 : SPACING.betweenEntries],
        ...getPdfStyle(`volunteering.${i}.organization`),
      });
      if (vol.bullets) {
        target.push({
          ul: vol.bullets.map((b, j) => ({
            text: b,
            margin: [0, 0, 0, 4],
            ...getPdfStyle(`volunteering.${i}.bullets.${j}`),
          })),
          margin: [0, SPACING.beforeBullets, 0, SPACING.afterBullets],
        });
      }
    });
  };

  const renderReferences = (target: Content[], width: number) => {
    if (!resume.references) return;
    addSectionHeader("References", "references-header", target, width);
    resume.references.forEach((ref_, i) => {
      target.push({
        text: ref_.name,
        bold: true,
        ...getPdfStyle(`references.${i}.name`),
        margin: [0, i === 0 ? 0 : SPACING.betweenEntries, 0, 2],
      });
      if (ref_.relationship) {
        target.push({
          text: ref_.relationship,
          italics: true,
          margin: [0, 0, 0, ref_.contact ? 2 : SPACING.betweenEntries],
          ...getPdfStyle(`references.${i}.relationship`),
        });
      }
      if (ref_.contact) {
        target.push({
          text: ref_.contact,
          margin: [0, 0, 0, SPACING.betweenEntries],
          ...getPdfStyle(`references.${i}.contact`),
        });
      }
    });
  };

  // Sections that render into the sidebar column in two-column layouts.
  // Everything else falls into the "main" column. "header" is always
  // rendered full-width above the columns.
  const SIDEBAR_KEYS: SectionKey[] = [
    "contact",
    "skills",
    "languages",
    "certifications",
  ];

  const SECTION_ORDER: SectionKey[] = [
    "header",
    "contact",
    "summary",
    "experience",
    "education",
    "skills",
    "certifications",
    "projects",
    "awards",
    "languages",
    "volunteering",
    "references",
  ];

  const renderSection = (key: SectionKey, target: Content[], width: number) => {
    switch (key) {
      case "header":
        renderHeader(target);
        break;
      case "contact":
        renderContact(target, width);
        break;
      case "summary":
        renderSummary(target, width);
        break;
      case "experience":
        renderExperience(target, width);
        break;
      case "education":
        renderEducation(target, width);
        break;
      case "skills":
        renderSkills(target, width);
        break;
      case "certifications":
        renderCertifications(target, width);
        break;
      case "projects":
        renderProjects(target, width);
        break;
      case "awards":
        renderAwards(target, width);
        break;
      case "languages":
        renderLanguages(target, width);
        break;
      case "volunteering":
        renderVolunteering(target, width);
        break;
      case "references":
        renderReferences(target, width);
        break;
    }
  };

  const activeSections = SECTION_ORDER.filter((k) => sections[k].include);

  const layout = currentSelectedLayout.value;

  if (!layout.columnSide) {
    // --- Vertical layout: everything in one flowing column ---
    activeSections.forEach((key) =>
      renderSection(key, content, PAGE_CONTENT_WIDTH),
    );
  } else {
    // --- Two-column layout ---
    // Header always spans the full page width, above the columns.
    if (sections.header.include) {
      renderHeader(content);
    }

    const availableWidth = PAGE_CONTENT_WIDTH - COLUMN_GAP;
    const sidebarWidth = availableWidth * SIDEBAR_RATIO;
    const mainWidth = availableWidth - sidebarWidth;

    const sidebar: Content[] = [];
    const main: Content[] = [];

    activeSections
      .filter((k) => k !== "header")
      .forEach((key) => {
        if (SIDEBAR_KEYS.includes(key)) {
          renderSection(key, sidebar, sidebarWidth);
        } else {
          renderSection(key, main, mainWidth);
        }
      });

    const sidebarColumn: Content = {
      stack: sidebar,
    };
    const mainColumn: Content = {
      stack: main,
    };

    content.push({
      columns:
        layout.columnSide === "left"
          ? [sidebarColumn, mainColumn]
          : [mainColumn, sidebarColumn],
      columnGap: COLUMN_GAP,
    });
  }

  const pdf = pdfMake.createPdf(docDefinition);
  const url = await pdf.getBlob();
  window.open(URL.createObjectURL(url), "_blank");
}
