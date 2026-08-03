/**
 * Form automation handlers.
 *
 * This module extracts form HTML from the active page, builds an AI prompt
 * from the saved profile and form structure, and sends the AI-backed result to the
 * original source tab.
 */
import type { BexBridge, PortName } from "@quasar/app-vite";
import type { AiPlatform } from "./aiTabs";
import { getProfile } from "src/db";

/**
 * Payload shape for the form-mapping request.
 */
interface GetFormMappingsPayload {
  ai: AiPlatform;
}

/**
 * Registers the form-related bridge listeners.
 */
export function registerFormHandlers(
  bridge: BexBridge,
  openAiSite: (
    platform: AiPlatform,
    active?: boolean,
  ) => Promise<{ url: string; port: string; id: number }>,
) {
  let sourceTabId: number | null = null;

  bridge.on("formFilled", ({ payload }) => {
    if (!sourceTabId) {
      console.warn(
        "[ApplyMate] Received formFilled event without an active source tab.",
      );
      return;
    }

    void chrome.tabs.sendMessage(sourceTabId, {
      type: "fillForm",
      payload,
    });
  });

  bridge.on("getFormMappings", async (message) => {
    const payload = message.payload as GetFormMappingsPayload | undefined;
    if (!payload) {
      return;
    }

    const [activeTab] = await chrome.tabs.query({ active: true });
    if (!activeTab?.id) {
      return;
    }

    sourceTabId = activeTab.id;
    const currentOpenedTab = await chrome.tabs.sendMessage(activeTab.id, {
      type: "getFormMappings",
    });

    const profile = await getProfile();
    const aiTab = await openAiSite(payload.ai, false);

    await bridge.send({
      event: "fillForm",
      to: aiTab.port as PortName,
      payload: {
        html: buildFormFillPrompt(profile, currentOpenedTab),
      },
    });

    return currentOpenedTab;
  });
}

function buildFormFillPrompt(profile: unknown, formHtml: string) {
  return `Use this HTML to fill the form and return the output as JSON with this structure:

\`\`\`json
[
  {
    "field": "string",
    "value": "string",
    "action": "type" | "click" | "select" | "file upload"
  }
]
\`\`\`

Use this user information to fill the form:
${JSON.stringify(profile)}

__________________________________________________________________

Here are the form fields that need to be filled:
${formHtml}
`;
}
