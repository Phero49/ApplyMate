interface FlexibleResume {
  layout?: "vertical" | "two-column";

  // Styles as CSS strings — simple, flexible, LLM-friendly
  style?: {
    // Global styles
    titleStyle?: string; // "font-weight:bold; font-size:16px; color:#1f2937;"
    bodyStyle?: string; // "font-size:14px; line-height:1.6; color:#374151;"
    headerStyle?: string; // "font-weight:600; font-size:14px; color:#1f2937;"
    headerRightStyle?: string; // "color:#6b7280;"
    subItemStyle?: string; // "font-size:14px; color:#4b5563; margin-top:2px;"
    separator?: boolean;
    separatorColor?: string;
  };

  head: {
    name: string;
    nameStyle?: string; // "font-size:24px; font-weight:bold; color:#111827;"
    headline: string;
    headlineStyle?: string; // "font-size:16px; color:#4b5563;"
    contact?: Array<{ label: string; value: string }>;
    includeContactLabel?: boolean;
  };

  body: Array<{
    side?: "side" | "main"; //   default main  //determine side where section should go only applicable in two column layout
    title: string;
    titleStyle?: string; // "font-weight:bold; font-size:16px; color:#1f2937;"
    items: Array<{
      header?: string[];
      headerAlign?: "left" | "between" | "right";
      headerStyle?: string; // Override global header style

      content?: string;
      contentStyle?: string; // Override global body style

      subItems?: string[];
      subItemsStyle?: string; // Override global sub-item style
      bullet?: string; // "•" | "-" | "◆" | "→"
    }>;
  }>;
}

type FontsList = {
  name: string;
  fontUrl: {
    normal: string;
    bold: string | undefined;
    italics: string | undefined;
    bolditalics: string | undefined;
  } | null;
}[];
