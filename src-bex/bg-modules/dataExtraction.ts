/**
 * Job extraction workflow handlers.
 *
 * This module uses the AI provider to extract structured job details from the
 * open page and then saves that result into the extension's saved-jobs store.
 */
import type { BexBridge, PortName } from "@quasar/app-vite";
import { addSavedJob } from "src/db";
import type { AiPlatform } from "./aiTabs";

/**
 * Payload sent from the app to start extraction from an AI provider tab.
 */
interface ExtractJobRequest {
  platform: AiPlatform;
  prompt: string;
  window: {
    favIconUrl: string;
    url: string;
    title: string;
    port: PortName;
  };
}

interface SavedJobDetails {
  title: string;
  publishedDate: string;
  closeDate: string;
  company: string;
  jobSummary: string;
}

export function registerExtractionHandlers(
  bridge: BexBridge,
  openAiSite: (
    platform: AiPlatform,
    active?: boolean,
  ) => Promise<{ url: string; port: string; id: number }>,
) {
  let sourceInfo: ExtractJobRequest["window"] | null = null;

  bridge.on("extract-job-details", async (message) => {
    const payload = message.payload as
      | ExtractJobRequest
      | SavedJobDetails
      | undefined;
    if (!payload) {
      return;
    }

    if (message.from !== "app") {
      await handleJobSave(payload as SavedJobDetails, sourceInfo);
      return;
    }

    sourceInfo = (payload as ExtractJobRequest).window;
    const aiTab = await openAiSite(
      (payload as ExtractJobRequest).platform,
      false,
    );

    await bridge.send({
      event: "extract-job-details",
      to: aiTab.port as PortName,
      payload: (payload as ExtractJobRequest).prompt,
    });
  });
}

async function handleJobSave(
  payload: SavedJobDetails,
  sourceInfo: ExtractJobRequest["window"] | null,
) {
  await addSavedJob({
    company: payload.company,
    summary: payload.jobSummary,
    applied: false,
    url: sourceInfo?.url || "",
    icon: sourceInfo?.favIconUrl || "",
    closeDate: payload.closeDate,
    title: payload.title,
    savedAt: new Date().toISOString(),
  });

  const tabs = await chrome.tabs.query({ active: true });
  tabs.forEach((tab) => {
    void chrome.tabs.sendMessage(tab.id!, {
      type: "showNotification",
      payload: {
        url: chrome.runtime.getURL(
          `www/index.html#/app/saved-jobs?job=${sourceInfo?.url || ""}`,
        ),
        message: `${payload.title}: Job saved successfully. You will be reminded every hour.`,
        type: "positive",
      },
    });
  });
}
