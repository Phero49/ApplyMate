import { defineStore } from "pinia";
import { ref } from "vue";

export type AdditionalITems = {
  layout: "row" | "column";
  items: { label: string; icon?: string; action: () => void; ui: "checkbox" }[];
};

export const useDomStore = defineStore("dom", {
  state: () => ({
    selectedElement: null as HTMLElement | null,
    selectedSection: null as string | null,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    additionalMenuitems: { items: [], layout: "column" } as AdditionalITems,
    undoStack: [] as string[],
    redoStack: [] as string[],
  }),
  actions: {
    removeSelected() {
      document.querySelectorAll(".bg-blue-2").forEach((el) => {
        el.remove();
      });
      this.selectedElement = null;
    },
    saveState() {
      const resumeRoot = document.querySelector(".resume-root");
      if (resumeRoot) {
        const newState = resumeRoot.innerHTML;
        // Don't save if it's the same as the current top of the stack
        if (
          this.undoStack.length > 0 &&
          this.undoStack[this.undoStack.length - 1] === newState
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
        const currentState = resumeRoot.innerHTML;
        this.redoStack.push(currentState);
        const previousState = this.undoStack.pop()!;
        resumeRoot.innerHTML = previousState;
        this.selectedElement = null;
      }
    },
    redo() {
      const resumeRoot = document.querySelector(".resume-root");
      if (resumeRoot && this.redoStack.length > 0) {
        const currentState = resumeRoot.innerHTML;
        this.undoStack.push(currentState);
        const nextState = this.redoStack.pop()!;
        resumeRoot.innerHTML = nextState;
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
  target.classList.add("bg-blue-2", "rounded-borders");
  target.contentEditable = "true";
  target.focus();
  target.addEventListener("blur", onBlur);
}

export function onBlur(event: Event) {
  const target = event.target as HTMLElement;
  target.classList.remove("bg-blue-2");
  target.contentEditable = "false";
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
  if (domeStore.selectedElement) {
    (domeStore.selectedElement.style as unknown as Record<string, string>)[
      property
    ] = value;
  }
  // Also apply to multi-selected items
  selectedItems.value.forEach((item) => {
    (item.style as unknown as Record<string, string>)[property] = value;
  });
}

export function applyCommand(command: string, value?: string) {
  domeStore.saveState();
  document.execCommand(command, false, value);
}

export const selectedItems = ref<HTMLElement[]>([]);

export function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

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
      item.classList.remove("bg-blue-2", "rounded-borders");
      selectedItems.value = selectedItems.value.filter((i) => i !== item);
    } else {
      // Select
      item.classList.add("bg-blue-2", "rounded-borders");
      selectedItems.value.push(item);
    }
  } else {
    // Standard click: Clear selection and select only this item
    selectedItems.value.forEach((i) => {
      i.classList.remove("bg-blue-2", "rounded-borders");
    });
    item.classList.add("bg-blue-2", "rounded-borders");
    selectedItems.value = [item];
    domeStore.selectedElement = item;
  }
}

export function setActive(el: HTMLElement) {
  if (domeStore.selectedElement) {
    domeStore.selectedElement.classList.remove("bg-blue-2", "rounded-borders");
  }

  domeStore.selectedElement = el;
  domeStore.selectedElement.classList.add("bg-blue-2", "rounded-borders");
}

export function setUnActive() {
  if (domeStore.selectedElement) {
    domeStore.selectedElement.classList.remove("bg-blue-2", "rounded-borders");
    domeStore.selectedElement = null;
  }
}
