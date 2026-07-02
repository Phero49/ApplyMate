import { attachResumePickerDropDown } from "./attachResumePicker";

/**
 * Prepares the entire document body DOM for AI analysis
 * First adds identifiers to real DOM, then clones
 * Strips headers, footers, noise, and non-essential attributes
 * Returns clean HTML with marked fields
 */
interface PreparedFormResult {
  cleanedHTML: string;
  fieldMap: Map<string, FieldInfo>;
  fieldCount: number;
}

interface FieldInfo {
  tagName: string;
  type: string;
  name: string | null;
  originalElement: HTMLElement; // Direct reference to real DOM element
}

export function prepareFormForAI(): PreparedFormResult {
  // Step 1: Add custom identifiers to the REAL DOM first
  const fieldMap = addIdentifiersToRealDOM();

  // Step 2: Now clone the body (identifiers will be in the clone)
  const clone = document.body.cloneNode(true) as HTMLElement;

  // Step 3: Remove page noise from clone (headers, footers, nav, etc)
  removePageNoise(clone);

  // Step 4: Remove empty text nodes from clone
  removeEmptyTextNodes(clone);

  // Step 5: Remove empty tags from clone
  removeEmptyTags(clone);

  // Step 6: Strip non-essential attributes from clone (keep data-field-id)
  stripNonEssentialAttributes(clone);

  // Return clean HTML and the mapping (which already has real element references)
  return {
    cleanedHTML: clone.outerHTML, // Fixed: removed trailing period
    fieldMap: fieldMap,
    fieldCount: fieldMap.size,
  };
}

/**
 * Adds data-field-id attributes to ALL form fields in the real DOM
 * Returns a map of fieldId -> original element reference
 */
function addIdentifiersToRealDOM(): Map<string, FieldInfo> {
  const fieldMap = new Map<string, FieldInfo>();
  let fieldCounter = 0;

  // Find all interactive form fields in the REAL document
  const fields = document.body.querySelectorAll("input, textarea, select");

  fields.forEach((field) => {
    // Skip if already has an identifier
    if (field.hasAttribute("data-field-id")) {
      return;
    }

    const fieldId = `field_${fieldCounter++}`;
    field.setAttribute("data-field-id", fieldId);

    // For checkboxes and radios, also mark their groups
    if (field instanceof HTMLInputElement && field.type === "radio") {
      const radioGroup = field.getAttribute("name");
      if (radioGroup) {
        field.setAttribute("data-radio-group", radioGroup);
      }
    }

    // Store field information with direct reference to the REAL element
    fieldMap.set(fieldId, {
      tagName: field.tagName,
      type: field instanceof HTMLInputElement ? field.type : field.tagName,
      name: field.getAttribute("name"),
      originalElement: field as HTMLElement,
    });
  });

  return fieldMap;
}

function removePageNoise(element: HTMLElement): void {
  const removeSelectors: string[] = [
    // Page structure
    "header",
    "footer",
    "nav",
    "aside",
    '[class*="header"]',
    '[class*="Header"]',
    '[class*="footer"]',
    '[class*="Footer"]',
    '[class*="navigation"]',
    '[class*="navbar"]',
    '[class*="breadcrumb"]',

    // Role attributes
    '[role="banner"]',
    '[role="navigation"]',
    '[role="contentinfo"]',
    "svg",
    "hr",
    "br",
    "button",
    // Hidden elements
    '[aria-hidden="true"]',
    "[type=hidden]",
    // Page utilities
    ".cookie-banner",
    ".cookie-consent",
    ".gdpr",
    ".advertisement",
    ".ad",
    ".banner-ad",
    ".newsletter-signup",
    ".email-capture",
    ".chat-widget",
    ".intercom",
    ".live-chat",

    // Social proof
    ".testimonial",
    ".review",
    ".rating",
    ".social-proof",
    ".trust-badge",

    // Scripts and styles
    "script",
    "style",
    'link[rel="stylesheet"]',

    // Iframes
    "iframe",
    "frame",
  ];

  removeSelectors.forEach((selector) => {
    try {
      const elements = element.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Invalid selector, skip
    }
  });
}

function removeEmptyTextNodes(element: HTMLElement): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      if (node.textContent?.trim() === "") {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });

  const emptyNodes: Text[] = [];
  while (walker.nextNode()) {
    emptyNodes.push(walker.currentNode as Text);
  }
  emptyNodes.forEach((node) => node.remove());
}

/**
 * Removes empty HTML tags from the cloned DOM
 * Tags are considered empty if they have no text content and no child elements
 * Preserves form fields and elements with attributes
 */
function removeEmptyTags(element: HTMLElement): void {
  // Tags that should never be removed even if empty (form elements, interactive elements)
  const preserveIfEmpty = new Set([
    "input",
    "textarea",
    "select",
    "button",
    "img",
    "br",
    "hr",
    "iframe",
    "script",
    "style",
    "link",
    "meta",
  ]);

  // Tags that are typically safe to remove when empty
  const safeToRemoveWhenEmpty = new Set([
    "div",
    "span",
    "p",
    "section",
    "article",
    "li",
    "ul",
    "ol",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "small",
    "label",
    "td",
    "th",
    "tr",
    "tbody",
    "thead",
    "table",
  ]);

  let removedCount = 0;
  const maxIterations = 100; // Prevent infinite loops with nested empty elements
  let iterations = 0;

  while (iterations < maxIterations) {
    let removedInThisPass = false;

    // Get all elements in the DOM
    const allElements = element.querySelectorAll("*");

    for (const el of Array.from(allElements)) {
      // Skip if element is no longer in the DOM
      if (!el.isConnected) continue;

      const tagName = el.tagName.toLowerCase();

      // Skip elements that should always be preserved
      if (preserveIfEmpty.has(tagName)) continue;

      // Skip elements that have form field identifiers (important for AI)
      if (el.hasAttribute("data-field-id")) continue;

      // Check if element is empty (no text content and no meaningful children)
      const hasTextContent = el.textContent?.trim().length > 0;
      const hasChildElements = el.children.length > 0;

      // Also check for non-empty attributes that might be important
      const hasImportantAttributes =
        el.hasAttribute("name") ||
        el.hasAttribute("value") ||
        el.hasAttribute("placeholder") ||
        el.hasAttribute("aria-label") ||
        el.hasAttribute("role") ||
        (el.hasAttribute("class") && el.getAttribute("class")?.trim()) ||
        (el.hasAttribute("id") && el.getAttribute("id")?.trim());

      // Consider empty if: no text, no children, and no important attributes
      // OR if it's a safe-to-remove tag type with just whitespace
      const isEmpty = !hasTextContent && !hasChildElements;
      const isWhitespaceOnly =
        safeToRemoveWhenEmpty.has(tagName) &&
        el.textContent?.trim() === "" &&
        !hasChildElements;

      if (isEmpty || isWhitespaceOnly) {
        // Special case: don't remove if it has important attributes
        if (!hasImportantAttributes) {
          el.remove();
          removedCount++;
          removedInThisPass = true;
        }
      }
    }

    if (!removedInThisPass) break;
    iterations++;
  }

  // Optional: Log cleanup stats
  if (removedCount > 0) {
    console.log(`[removeEmptyTags] Removed ${removedCount} empty tags`);
  }
}

function stripNonEssentialAttributes(element: HTMLElement): void {
  // Only keep these attributes (including our data-field-id)
  const keepAttrs: string[] = [
    "type",
    "name",
    "value",
    "checked",
    "selected",
    "placeholder",
    "required",
    "disabled",
    "role",
    "aria-label",
    "aria-labelledby",
    "data-field-id",
    "data-radio-group", // Keep our custom identifiers
  ];

  const allElements = element.querySelectorAll("*");
  allElements.forEach((el) => {
    const attrsToRemove: string[] = [];
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (
        !keepAttrs.includes(attr!.name) &&
        !attr!.name.startsWith("data-field-id")
      ) {
        attrsToRemove.push(attr!.name);
      }
    }
    attrsToRemove.forEach((attrName) => {
      el.removeAttribute(attrName);
    });
  });
}

export type Fields = {
  field: string;
  value: string;
  action: "type" | "click" | "select" | "file upload";
}[];
/**
 * After AI processing, use this to fill the original form fields
 * The fieldMap already contains direct references to original elements
 */
export function fillFromAIMappings(fieldMap: Fields): void {
  for (const value of fieldMap) {
    const element = document.querySelector(`[data-field-id=${value.field}]`);
    // Handle different input types
    if (element instanceof HTMLInputElement) {
      switch (element.type) {
        case "checkbox":
          element.checked =
            typeof value.value == "boolean"
              ? value.value
              : value.value == "true"
                ? true
                : false;
          element.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        case "radio":
          element.checked = element.checked =
            typeof value.value == "boolean"
              ? value.value
              : value.value == "true"
                ? true
                : false;
          element.dispatchEvent(new Event("change", { bubbles: true }));

          break;
        case "file":
          attachResumePickerDropDown(element, [], (resume) => {
            console.log(resume);
          });
          break;
        default:
          element.value = value.value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } else if (element instanceof HTMLTextAreaElement) {
      element.value = value.value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (element instanceof HTMLSelectElement) {
      element.value = value.value;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

// Usage example
// const result = prepareFormForAI();
// console.log("Clean HTML for AI:", result.cleanedHTML);
// console.log("Fields found:", result.fieldCount);

// After AI returns mappings, fill the original form:
// const aiMappings = new Map(); // This would come from your AI call
// fillFromAIMappings(result.fieldMap, aiMappings);
