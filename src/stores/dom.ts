/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { useAppContext } from "./appStore";
import { ref } from "vue";

export type AdditionalITems = {
  layout: "row" | "column";
  items: { label: string; icon?: string; action: () => void; ui: "checkbox" }[];
};

export const useDomStore = defineStore("dom", {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    styles: {} as { [key: string]: Record<string, string | boolean | number> },
    font: "",
    fontSize: "",
    selectedElement: null as HTMLElement | null,
    selectedSection: null as string | null,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    additionalMenuitems: { items: [], layout: "column" } as AdditionalITems,
    undoStack: [] as { html: string; resume: any }[],
    redoStack: [] as { html: string; resume: any }[],
  }),
  actions: {
    putObjectStyle(
      key: string,
      value: Record<string, string | boolean | number>,
    ) {
      this.styles[key] = value;
    },
    removeObjectStyle(key: string) {
      delete this.styles[key];
    },
    removeSelected() {
      document.querySelectorAll(".item-selected").forEach((el) => {
        const parent = getParentItem(el as HTMLElement);
        if (parent) {
          const itemName = parent.getAttribute("item-name");
          if (itemName) {
            const keys = itemName.split(".");
            let item = useAppContext().resume;
            for (let i = 0; i < keys.length - 1; i++) {
              item = item[keys[i] as keyof typeof item] as any;
            }
            delete item[keys[keys.length - 1] as keyof typeof item];
          }
        }
        el.remove();
      });
      this.selectedElement = null;
    },
    saveState() {
      const resumeRoot = document.querySelector(".resume-root");
      if (resumeRoot) {
        const appStore = useAppContext();
        const html = resumeRoot.innerHTML;
        const resume = JSON.parse(JSON.stringify(appStore.resume));

        const newState = { html, resume };

        // Don't save if it's the same as the current top of the stack
        if (
          this.undoStack.length > 0 &&
          this.undoStack[this.undoStack.length - 1]?.html === html
        ) {
          return;
        }
        // Limit stack size to 50
        if (this.undoStack.length >= 50) {
          this.undoStack.shift();
        }
        this.undoStack.push(newState);
        this.redoStack = [];
      }
    },
    undo() {
      const resumeRoot = document.querySelector(".resume-root");
      if (resumeRoot && this.undoStack.length > 0) {
        const appStore = useAppContext();
        const currentState = {
          html: resumeRoot.innerHTML,
          resume: JSON.parse(JSON.stringify(appStore.resume)),
        };
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop()!;
        resumeRoot.innerHTML = previousState.html;
        appStore.resume = previousState.resume;

        this.selectedElement = null;
      }
    },
    redo() {
      const resumeRoot = document.querySelector(".resume-root");
      if (resumeRoot && this.redoStack.length > 0) {
        const appStore = useAppContext();
        const currentState = {
          html: resumeRoot.innerHTML,
          resume: JSON.parse(JSON.stringify(appStore.resume)),
        };
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop()!;
        resumeRoot.innerHTML = nextState.html;
        appStore.resume = nextState.resume;

        this.selectedElement = null;
      }
    },
  },
});

const domeStore = useDomStore();

export function onDoubleClick(event: Event) {
  const target = event.target as HTMLElement;
  if (target.classList.contains("content-container")) {
    return;
  }
  // Save state before starting edit
  domeStore.saveState();

  domeStore.selectedElement = target;
  target.classList.add("item-selected", "rounded-borders");
  target.contentEditable = "true";
  target.focus();
  target.addEventListener("blur", onBlur);
}

export function onBlur(event: Event) {
  const target = event.target as HTMLElement;
  target.classList.remove("item-selected");
  target.contentEditable = "false";
  const parent = getParentItem(target);
  if (parent) {
    const itemName = parent.getAttribute("item-name");
    if (itemName) {
      const keys = itemName.split(".");
      let item = useAppContext().resume;
      for (let i = 0; i < keys.length - 1; i++) {
        item = item[keys[i] as keyof typeof item] as any;
      }
      item[keys[keys.length - 1] as keyof typeof item] =
        target.textContent as any;
    }
  }
  // Save state after blur if content changed
  // (In a real app we might compare HTML to avoid redundant saves)
  domeStore.saveState();
}

export function onContextMenu(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // If we're right-clicking an editable area or its parent
  const editable = target.closest(
    "[contenteditable='true'], .editable, .content-container > *",
  );
  if (editable) {
    domeStore.selectedElement = editable as HTMLElement;
  }
}

export function applyStyle(property: string, value: string) {
  domeStore.saveState();

  const updateStyle = (item: HTMLElement) => {
    // 1. Precise DOM Update (The "Disconnected" approach - immediate & high specificity)
    (item.style as any)[property] = value;

    // 2. Centralized Store Update (The "Sync" approach - persistent & used for PDF)
    const elWithName = getParentItem(item);
    const name = elWithName?.getAttribute("item-name");
    if (!name) return;

    const currentStyle = { ...(domeStore.styles[name] || {}) };

    // Toggle logic for specific properties
    if (
      ["fontWeight", "fontStyle", "textDecoration"].includes(property) &&
      currentStyle[property] === value
    ) {
      currentStyle[property] = "";
      (item.style as any)[property] = ""; // Reset DOM as well
    } else {
      currentStyle[property] = value;
    }

    domeStore.styles[name] = currentStyle;
  };

  if (domeStore.selectedElement) {
    updateStyle(domeStore.selectedElement);
  }

  // Also apply to multi-selected items
  selectedItems.value.forEach((item) => {
    updateStyle(item);
  });
}

export function applyCommand(
  command: "bold" | "italic" | "underline",
  value?: string,
) {
  domeStore.saveState();
  document.execCommand(command, false, value);
}

export const selectedItems = ref<HTMLElement[]>([]);

function getParentItem(target: HTMLElement) {
  if (target.getAttribute("item-name")) {
    return target;
  }
  if (!target.parentElement) {
    return null;
  }
  return getParentItem(target.parentElement);
}

export function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  console.log(target.getAttribute("item-name"), target);
  const node = target.firstChild;
  if (node && node?.TEXT_NODE != 3) {
    return;
  }

  const item = target;

  if (!item) return;

  if (event.ctrlKey) {
    event.preventDefault(); // Prevent text selection
    if (selectedItems.value.includes(item)) {
      // Deselect
      item.classList.remove("item-selected", "rounded-borders");
      selectedItems.value = selectedItems.value.filter((i) => i !== item);
    } else {
      // Select
      item.classList.add("item-selected", "rounded-borders");
      selectedItems.value.push(item);
    }
  } else {
    // Standard click: Clear selection and select only this item
    selectedItems.value.forEach((i) => {
      i.classList.remove("item-selected", "rounded-borders");
    });
    item.classList.add("item-selected", "rounded-borders");
    selectedItems.value = [item];
    domeStore.selectedElement = item;
  }
}

export function setActive(el: HTMLElement) {
  if (domeStore.selectedElement) {
    domeStore.selectedElement.classList.remove(
      "item-selected",
      "rounded-borders",
    );
  }

  domeStore.selectedElement = el;
  domeStore.selectedElement.classList.add("item-selected", "rounded-borders");
}

export function setUnActive() {
  if (domeStore.selectedElement) {
    domeStore.selectedElement.classList.remove(
      "item-selected",
      "rounded-borders",
    );
    domeStore.selectedElement = null;
  }
}
