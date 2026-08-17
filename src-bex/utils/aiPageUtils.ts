export let currentSelector = "";

function getElementBySelector(selector: string) {
  if (selector === "rich-textarea") {
    return getGeminiInput();
  }
  return document.querySelector<HTMLElement>(selector);
}

/**
 * Waits for an element matching the given selector to appear in the DOM.
 *
 * The DOM is checked once every second for up to 75 attempts (75 seconds).
 *
 * @param selector - The selector used to locate the element.
 * @returns A promise that resolves with the found element or rejects if it
 *          cannot be found within the timeout period.
 */
export const waitForSelector = (selector: string): Promise<Element> => {
  // Maximum number of polling attempts (75 seconds).
  const maxAttempts = 75;

  // Tracks how many times we've checked for the element.
  let attempts = 0;

  // Store the selector so other parts of the extension know what we're waiting for.
  currentSelector = selector;

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      attempts++;

      // Try to locate the element.
      const element = getElementBySelector(selector);

      // Resolve immediately when the element is found.
      if (element) {
        clearInterval(interval);
        resolve(element);
        return;
      }

      // Stop polling after the maximum number of attempts.
      if (attempts >= maxAttempts) {
        clearInterval(interval);

        reject(
          new Error(
            "Failed to locate the input field. Please make sure you're logged in or check your network connection.",
          ),
        );
      }
    }, 1000);
  });
};

export const fillInput = (
  selector: string,
  value: string,
  timeoutMs: number = 5000,
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const attemptFill = () => {
      const element = getElementBySelector(selector);

      if (element) {
        // Element found - fill it
        if (element instanceof HTMLTextAreaElement) {
          element.value = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (element.getAttribute("contenteditable") === "true") {
          element.innerText = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Clean up and resolve
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
        return;
      }

      // Check if timeout has been reached
      if (Date.now() - startTime >= timeoutMs) {
        // Clean up and exit quietly (resolve without doing anything)
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(); // Quiet exit - resolve without error
        return;
      }
    };

    // Initial attempt
    attemptFill();

    // Set up retry interval (every 2 seconds)
    intervalId = setInterval(attemptFill, 2000);

    // Set up overall timeout
    timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      resolve(); // Quiet exit on timeout
    }, timeoutMs);
  });
};

function getGeminiInput(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>("rich-textarea");
  if (el) {
    const input = el.querySelector<HTMLElement>("[contenteditable=true]");
    if (input) {
      return input;
    }
    const shadowRoot = chrome.dom.openOrClosedShadowRoot(el);
    if (shadowRoot) {
      return shadowRoot.querySelector<HTMLElement>("[contenteditable=true]");
    }
  }
  return null;
}

export function dispatchEnter(element: HTMLElement) {
  element.focus();

  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
}
