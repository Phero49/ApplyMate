/**
 * Resume generation and delivery handlers.
 *
 * This module owns the workflow that starts resume generation in an AI tab,
 * persists the generated result, and forwards it back into the extension UI.
 */
import type { BexBridge, PortName } from "@quasar/app-vite";
import { saveGeneratedResume } from "src/db";
import type { AiPlatform } from "./aiTabs";

/**
 * Payload used when the app asks background to generate a resume.
 */
interface GenerateResumePayload {
  ai: AiPlatform;
  resumeData: string;
  jobDescription: string;
  url: string;
  title: string;
}

interface ResumeGeneratedPayload {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resume: any;
  sourceUrl: string;
  chatUrl: string;
  title: string;
}

export function registerResumeHandlers(
  bridge: BexBridge,
  openAiSite: (
    platform: AiPlatform,
    active?: boolean,
  ) => Promise<{ url: string; port: string; id: number }>,
  openExtension: (page: string) => void,
) {
  let tempResumeData: ResumeGeneratedPayload | null = null;

  bridge.on("getGeneratedResume", () => tempResumeData);

  bridge.on("resumeGenerated", async (message) => {
    const payload = message.payload as ResumeGeneratedPayload | undefined;
    if (!payload) {
      return;
    }

    tempResumeData = payload;
    await saveGeneratedResume({
      chatUrl: payload.chatUrl,
      url: payload.chatUrl,
      sourceUrl: payload.sourceUrl,
      resume: payload.resume,
      createdAt: new Date().toISOString(),
      title: payload.title,
    });
    await forwardResumeToApp(bridge, payload, openExtension);
  });

  bridge.on("generate-resume", async (message) => {
    const payload = message.payload as GenerateResumePayload | undefined;
    if (!payload) {
      return;
    }

    const aiTab = await openAiSite(payload.ai);

    await bridge.send({
      event: "generate-resume",
      to: aiTab.port as PortName,
      payload: {
        resumeData: payload.resumeData,
        jobDescription: payload.jobDescription,
        url: payload.url,
        title: payload.title,
      },
    });
  });
}

async function forwardResumeToApp(
  bridge: BexBridge,
  payload: ResumeGeneratedPayload,
  openExtension: (page: string) => void,
) {
  const appTabs = await chrome.tabs.query({
    url: chrome.runtime.getURL("www/index.html"),
  });

  const sendResume = () => {
    void bridge.send({
      event: "resumeGenerated",
      to: "app",
      payload,
    });
  };

  if (appTabs.length > 0) {
    if (bridge.portList.includes("app")) {
      sendResume();
      return;
    }

    appTabs[0]!.active = true;
    setTimeout(sendResume, 2000);
    return;
  }

  openExtension(`/app/resume-builder?href=${payload.url}`);
  setTimeout(sendResume, 2000);
}
