/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_FONT = "Roboto";
const BASE_FONT_SIZE = 12; // used to resolve em/rem

const PROP_MAP: Record<string, keyof pdfMake.Style> = {
  "font-family": "font",
  "font-size": "fontSize",
  "font-weight": "bold",
  "font-style": "italics",
  color: "color",
  "background-color": "background",
  "text-align": "alignment",
  "letter-spacing": "characterSpacing",
  "line-height": "lineHeight",
  "text-decoration": "decoration",
  "text-decoration-style": "decorationStyle",
  "text-decoration-color": "decorationColor",
  "text-decoration-thickness": "decorationThickness",
  "word-break": "wordBreak",
};

const LENGTH_PROPS = new Set<keyof pdfMake.Style>([
  "fontSize",
  "characterSpacing",
  "decorationThickness",
]);

function toPt(num: number, unit: string): number {
  switch (unit) {
    case "px":
      return num * 0.75;
    case "em":
    case "rem":
      return num * BASE_FONT_SIZE;
    case "pt":
    default:
      return num;
  }
}

function parseLength(val: string): number | null {
  const m = val.match(/^([\d.]+)(px|pt|em|rem)?$/);
  if (!m) return null;
  return toPt(parseFloat(m[1]!), m[2] ?? "pt");
}

type HandlerResult = string | boolean | null | undefined;

const handlers: Record<string, (val: string) => HandlerResult> = {
  font: () => DEFAULT_FONT,
  bold: (val) => {
    const w = parseInt(val, 10);
    if (!isNaN(w)) return w >= 600;
    if (val === "bold" || val === "bolder") return true;
    if (val === "normal" || val === "lighter") return false;
    return undefined;
  },
  italics: (val) => {
    if (val === "italic" || val === "oblique") return true;
    if (val === "normal") return false;
    return undefined;
  },
  alignment: (val) =>
    ["left", "center", "right", "justify"].includes(val) ? val : undefined,
  decoration: (val) => {
    if (val === "none") return null;
    const map: Record<string, string> = {
      underline: "underline",
      "line-through": "lineThrough",
      overline: "overline",
    };
    return map[val];
  },
  decorationStyle: (val) =>
    ["dashed", "dotted", "double", "wavy"].includes(val) ? val : undefined,
  wordBreak: (val) => (val === "break-all" ? "break-all" : undefined),
};

export function mapStyles(
  cssStyleString: string | null | undefined,
): pdfMake.Style {
  if (!cssStyleString || typeof cssStyleString !== "string") return {};

  const result: pdfMake.Style = {};

  for (const decl of cssStyleString.split(";")) {
    if (!decl.trim()) continue;
    const [rawProp, rawVal] = decl.split(":").map((s) => s?.trim());
    if (!rawProp || !rawVal) continue;

    const pdfProp = PROP_MAP[rawProp.toLowerCase()];
    if (!pdfProp) continue;

    if (LENGTH_PROPS.has(pdfProp)) {
      const pt = parseLength(rawVal);
      if (pt !== null) (result as any)[pdfProp] = pt;
      continue;
    }

    if (pdfProp === "lineHeight") {
      const n = parseFloat(rawVal);
      if (!isNaN(n)) result.lineHeight = n;
      continue;
    }

    const handler = handlers[pdfProp];
    if (handler) {
      const mapped = handler(rawVal.toLowerCase());
      if (mapped === null) {
        delete (result as any)[pdfProp];
      } else if (mapped !== undefined) {
        (result as any)[pdfProp] = mapped;
      }
      continue;
    }

    (result as any)[pdfProp] = rawVal;
  }

  return result;
}

function parseLengthValue(value: string | undefined): number {
  if (!value) return 0;
  const m = value.trim().match(/^(-?[\d.]+)(px|pt|em|rem|%)?$/i);
  if (!m) return 0; // covers 'auto' and anything unparseable
  return toPt(parseFloat(m[1]!), (m[2] ?? "pt").toLowerCase());
}

// pdfmake order: [left, top, right, bottom]
export function extractMargin(
  cssStyleString: string,
): [number, number, number, number] {
  let margin: [number, number, number, number] = [0, 0, 0, 0];

  if (!cssStyleString || typeof cssStyleString !== "string") {
    return margin;
  }

  // Shorthand `margin: ...`. Negative lookbehind avoids matching
  // margin-top / margin-right / etc.
  const shorthandMatch = cssStyleString.match(
    /(?<![\w-])margin\s*:\s*([^;]+)/i,
  );

  if (shorthandMatch) {
    const parts = shorthandMatch[1]!.trim().split(/\s+/);
    const [top, right, bottom, left] = (() => {
      switch (parts.length) {
        case 1: {
          const v = parseLengthValue(parts[0]);
          return [v, v, v, v];
        }
        case 2: {
          const v0 = parseLengthValue(parts[0]);
          const v1 = parseLengthValue(parts[1]);
          return [v0, v1, v0, v1];
        }
        case 3: {
          const v0 = parseLengthValue(parts[0]);
          const v1 = parseLengthValue(parts[1]);
          const v2 = parseLengthValue(parts[2]);
          return [v0, v1, v2, v1];
        }
        case 4:
        default:
          return [
            parseLengthValue(parts[0]),
            parseLengthValue(parts[1]),
            parseLengthValue(parts[2]),
            parseLengthValue(parts[3]),
          ];
      }
    })();
    // CSS order [top, right, bottom, left] -> pdfmake order [left, top, right, bottom]
    margin = [left, top, right, bottom];
  }

  // Individual longhand properties override the shorthand (or set values
  // when no shorthand was present), matching normal CSS cascade behaviour.
  const longhand: Record<string, number> = {
    "margin-top": 1,
    "margin-right": 2,
    "margin-bottom": 3,
    "margin-left": 0,
  };

  for (const [prop, pos] of Object.entries(longhand)) {
    const m = cssStyleString.match(
      new RegExp(`(?<![\\w-])${prop}\\s*:\\s*([^;]+)`, "i"),
    );
    if (m) {
      margin[pos] = parseLengthValue(m[1]);
    }
  }

  return margin;
}
