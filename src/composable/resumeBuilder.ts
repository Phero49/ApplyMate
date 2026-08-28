import { biLayoutSidebar, biSquare } from "@quasar/extras/bootstrap-icons";
import { reactive } from "vue";
import pdfMake from "pdfmake";
import { useAppContext } from "src/stores/appStore";
import type {
  TDocumentDefinitions,
  Content,
  TFontDictionary,
} from "pdfmake/interfaces";

import { Notify } from "quasar";
import { extractMargin, mapStyles } from "src/utils/helpers";

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
    name: "two-column",
    icon: biLayoutSidebar,
    columnSide: "left",
  },
]);
const appStore = useAppContext();

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
  if (resume == null) {
    return;
  }
  const currentFont = appStore.resumeFonts.find(
    (v) => v.name === appStore.selectedFont,
  );

  if (currentFont == undefined) {
    Notify.create({ message: "failed to find and load font" });
    return;
  }

  const font = {} as TFontDictionary;
  font[currentFont.name] = {
    ...currentFont["fontUrl"],
  };
  pdfMake.addFonts(font);
  /**format contacts include labels as  label:value if include label is set to true returns a string  */
  const formatContacts =
    resume.head.contact
      ?.map((v) =>
        resume.head.includeContactLabel ? `${v.label}:${v.value}` : v.value,
      )
      .join("   ") || "";

  const contents: { side: Content[]; main: Content[] } = {
    main: [],
    side: [],
  }; /**
   * format body
   */
  resume.body.forEach((v) => {
    //section title
    const key =
      resume.layout == "two-column"
        ? v.side == "side"
          ? "side"
          : "main"
        : "main";
    const body: Content[] = [
      {
        text: v.title,
        style: {
          ...mapStyles(resume.style?.titleStyle),
          ...mapStyles(v.titleStyle),
        },
      },
    ];

    v.items.forEach((item) => {
      body.push({
        columns: [
          //add section hear like company and tile year in the experience
          ...(item.header?.map(
            (v, i) =>
              ({
                text: v,
                width: "*",
                alignment: i == 0 ? "left" : "right",
              }) as Content,
          ) || []),
        ],
        //default justify between

        style: {
          ...mapStyles(resume.style?.headerRightStyle),
          ...mapStyles(item.headerStyle),
        },
      });
      body.push({
        text: item.content || "",
        style: {
          ...mapStyles(item.contentStyle),
        },
      });
      if (item.subItems) {
        body.push({
          ul: [
            ...item.subItems.map((subItem) => ({
              text: subItem,
              style: {
                ...mapStyles(resume.style?.subItemStyle),
                ...mapStyles(subItem),
              },
            })),
          ],
        });
      }
    });
    if (resume.style?.separator) {
      body.push({
        canvas: [
          {
            type: "line",
            lineColor: resume.style?.separatorColor || "blue",
            x1: 0, // X coordinate of the starting point
            y1: 5, // Y coordinate of the starting point (from the top of the element)
            x2: 515, // X coordinate of the ending point
            y2: 5, // Y coordinate of the ending point (same as y1 for horizontal)
            lineWidth: 2,
          },
        ],
        margin: [5, 10, 0, 5],
      });
    }

    contents[key].push(body);
  });
  const docDefinition: TDocumentDefinitions = {
    defaultStyle: {
      font: appStore.selectedFont,
      fontSize: 10,

      lineHeight: SPACING.lineHeight,
    },
    content: [
      //head
      {
        text: resume.head.name,
        margin: extractMargin(resume.head.nameStyle || ""),
        style: mapStyles(resume.head.nameStyle),
      },
      {
        text: resume.head.headline,
        margin: extractMargin(resume.head.headlineStyle || ""),
        style: mapStyles(resume.head.headlineStyle),
      },
      {
        text: formatContacts,
      },
      resume.layout == "vertical"
        ? contents.main
        : {
            columns: [
              { width: "30%", stack: contents.side },
              { width: "70%", stack: contents.main },
            ],
          },
    ],
  };

  const pdf = pdfMake.createPdf(docDefinition);
  const url = await pdf.getBlob();
  window.open(URL.createObjectURL(url), "_blank");
}
