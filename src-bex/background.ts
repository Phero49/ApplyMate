/**
 * Importing the file below initializes the extension background.
 *
 * Warnings:
 * 1. Do NOT remove the import statement below. It is required for the extension to work.
 *    If you don't need createBridge(), leave it as "import '#q-app/bex/background'".
 * 2. Do NOT import this file in multiple background scripts. Only in one!
 * 3. Import it in your background service worker (if available for your target browser).
 */
import { createBridge } from "#q-app/bex/background";
import type { PortName } from "@quasar/app-vite";
import {
  addSavedJob,
  getProfile,
  getSavedJobs,
  addNotification,
  saveGeneratedResume,
} from "src/db";

/**
 * Stores the tab information of the tab that sent the request
 */
const workingTabs = {
  from: {} as chrome.tabs.Tab,
  current: {} as chrome.tabs.Tab,
};
/**
 * Opens the extension's main interface in a new browser tab
 * @param page - The route/page to navigate to within the extension (e.g., "index.html#/resume-builder")
 */
function openExtension(page: string) {
  chrome.tabs.create(
    {
      url: chrome.runtime.getURL("www/index.html#" + page),
    },
    (/* newTab */) => {
      // Tab opened successfully - callback executed after tab creation
    },
  );
}

/**
 * Stores the currently active AI site tab that the extension is interacting with
 * Tracks URL, port name for communication, and tab ID
 */
let activeTab: { url: string; port: string; id: number } | null = null;

/**
 * Flag to control when to listen for AI page load events
 * Prevents normal AI sessions (not triggered by the extension) from triggering listeners
 * This ensures only extension-initiated sessions are processed
 */
let listenToPageLoad = false;

/**
 * Opens a specific AI platform website and waits for it to load
 * @param platform - The AI platform to open (chatgpt, deepseek, gemini, or qwen)
 * @param onLoaded - Callback function executed when the AI site has successfully loaded
 */
const openAiSite = async (
  platform: "chatgpt" | "deepseek" | "gemini" | "qwen",
  onLoaded: (data?: typeof activeTab) => void | Promise<void>,
  active = true,
) => {
  // Map of platform names to their respective URLs
  const aiSites = {
    chatgpt: "https://chatgpt.com",
    deepseek: "https://chat.deepseek.com",
    gemini: "https://gemini.google.com",
    qwen: "https://chat.qwen.ai",
  };

  const [tab] = await chrome.tabs.query({ active: true });
  if (tab) {
    workingTabs.from = tab;
  }
  // Create a new tab with the selected AI platform
  await chrome.tabs.create({
    url: aiSites[platform],
    active: active,
  });

  // Listen for the "aiSiteLoaded" event from the content script
  bridge.on("aiSiteLoaded", ({ payload }) => {
    if (listenToPageLoad) {
      // Only process if we're expecting this load event
      activeTab = payload;
      void onLoaded(payload); // Execute the callback when site is ready
    }
  });
};

// Uncomment to open extension automatically when installed
//chrome.runtime.onInstalled.addListener(openExtension);

/**
 * Type declaration for the extension's event communication map
 * Defines all possible events that can be sent/received via the bridge
 */
declare module "@quasar/app-vite" {
  interface BexEventMap {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    log: [{ message: string; data?: any[] }, void]; // Logging event
    getTime: [never, number]; // Get current timestamp

    "storage.get": [string | undefined, any]; // Retrieve from storage
    "storage.set": [{ key: string; value: any }, void]; // Save to storage
    "storage.remove": [string, void]; // Remove from storage
    "extract-job-details": [{ site: string; prompt: string }];

    // Extract job info
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

/**
 * Create the communication bridge between background script, content scripts, and app
 * Enables bidirectional messaging across all extension components
 * Set debug: false to disable verbose logging in production
 */
const bridge = createBridge({ debug: false });

/**
 * Get the currently active tab in the browser
 * @returns The active tab object or undefined if no active tab exists
 */
bridge.on("getCurrentOpenedTab", async () => {
  const [tab] = await chrome.tabs.query({ active: true });
  if (tab) {
    // Request tab info from the content script
    const currentOpenedTab = await chrome.tabs.sendMessage(tab.id!, {
      type: "getCurrentOpenedTab",
    });
    return currentOpenedTab;
  }
});

bridge.on("formFilled", ({ payload }) => {
  workingTabs.from.active = true;
  console.log("fillForm", payload);

  void chrome.tabs.sendMessage(workingTabs.from.id!, {
    type: "fillForm",
    payload,
  });
});
bridge.on("getFormMappings", async ({ payload }) => {
  const [tab] = await chrome.tabs.query({ active: true });
  if (tab) {
    // Request tab info from the content script
    const currentOpenedTab = await chrome.tabs.sendMessage(tab.id!, {
      type: "getFormMappings",
    });
    listenToPageLoad = true;

    void openAiSite(
      payload.ai,
      async () => {
        listenToPageLoad = false;
        const profile = await getProfile();
        await bridge.send({
          event: "fillForm",
          to: activeTab?.port as PortName,
          payload: {
            html: `
        use this html to fill the form  return the output as a json with this structure
        for the field property  match it with the data-field-id attribute of the input elements
        \`\`\`json
        [{
        field:string
        value:string
        action: "type" | "click" | "select"|'file upload'
      }....]
        \`\`\`


        #use this user information to fill the form:

        ${JSON.stringify(profile)}
__________________________________________________________________
      
#Here are the forms need to be filled:
        ${currentOpenedTab}
        
        
        `,
          },
        });
      },
      false,
    );
    return currentOpenedTab;
  }
});

/**
 * Get the body text content from the currently active tab
 * @returns The document body text or undefined if no active tab
 */
bridge.on("getCurrentDocumentBodyText", async () => {
  const [tab] = await chrome.tabs.query({ active: true });
  if (tab) {
    // Request body text from the content script
    const currentOpenedTab = await chrome.tabs.sendMessage(tab.id!, {
      type: "getCurrentDocumentBodyText",
    });
    return currentOpenedTab;
  }
});

/**
 * Open an AI site when requested from the app or content script
 */
bridge.on("openAiSite", ({ payload }) => {
  void openAiSite(payload, () => {});
});

bridge.on("startNewChat", ({ payload }) => {
  void openAiSite(payload, () => {});
});

/**
 * Open the extension interface at a specific page
 */
bridge.on("openExtension", ({ payload }) => {
  openExtension(payload);
});

bridge.on("chatProxyResponse", ({ payload }) => {
  void bridge.send({
    event: "receiveChatProxyResponse",
    payload: payload,
    to: "app",
  });
});
/**
 * Temporary storage for generated resume data
 * Used to pass resume data between components when extension is not open
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tempResumeData: any = null;

bridge.on("getGeneratedResume", () => {
  return tempResumeData;
});
/**
 * Handle resume-generated events - store and forward resume data
 * If extension tab is open, send directly; otherwise open extension first
 */
bridge.on("resumeGenerated", async ({ payload }) => {
  tempResumeData = payload;
  void saveGeneratedResume(payload);

  // Check if extension tab is already open
  const tab = await chrome.tabs.query({
    url: chrome.runtime.getURL("www/index.html"),
  });

  if (tab.length > 0) {
    if (bridge.portList.includes("app")) {
      void bridge.send({
        event: "resumeGenerated",
        to: "app",
        payload: payload,
      });
    } else {
      tab[0]!.active = true;
      setTimeout(() => {
        void bridge.send({
          event: "resumeGenerated",
          to: "app",
          payload: payload,
        });
      }, 2000);
    }
    // Extension is open, send directly
  } else {
    // Extension not open, open it and then send after delay
    openExtension(`/app/resume-builder?href=${payload.url}`);
    setTimeout(() => {
      void bridge.send({
        event: "resumeGenerated",
        to: "app",
        payload: payload,
      });
    }, 2000);
  }
});

/**
 * Generate a resume based on AI analysis
 * Opens the specified AI platform and- sends resume data + job description
 */
bridge.on("generate-resume", ({ payload }) => {
  listenToPageLoad = true; // Enable listening for AI page load
  void openAiSite(payload.ai, () => {
    // Send generation request to the content script in the AI tab
    void bridge.send({
      event: "generate-resume",
      to: (activeTab?.port || "") as PortName,
      payload: {
        resumeData: payload.resumeData,
        jobDescription: payload.jobDescription,
        url: payload.url,
        title: payload.title,
      },
    });
    listenToPageLoad = false; // Disable listening after processing
  });
});

/**
 * used by extract job details to store the website info about the source
 */
let sourceInfo = null as null | {
  favIconUrl: string;
  url: string;
  title: string;
  port: PortName;
};

/**
 * Extract job details from a webpage using AI
 * Opens AI platform, sends extraction prompt, and returns the response
 */
bridge.on("extract-job-details", async ({ payload, from }) => {
  if (from != "app") {
    const p = payload as {
      title: string;
      publishedDate: string;
      closeDate: string;
      company: string;
      jobSummary: string;
    };
    await addSavedJob({
      company: p.company,
      summary: p.jobSummary,
      applied: false,
      url: sourceInfo?.url || "",
      icon: sourceInfo?.favIconUrl || "",
      closeDate: p.closeDate,
      title: p.title,
      savedAt: new Date().toISOString(),
    });
    listenToPageLoad = false;
    const tabs = await chrome.tabs.query({ active: true });
    tabs.forEach((t) => {
      void chrome.tabs.sendMessage(t.id!, {
        type: "showNotification",
        payload: {
          url: chrome.runtime.getURL(
            `www/index.html#/app/saved-jobs?job=${sourceInfo?.url}`,
          ),
          message: `${p.title} : Job saved successfully you will be reminded every 1 hour`,
          type: "positive",
        },
      });
    });

    return;
  }

  listenToPageLoad = true; // Enable listening for AI page load

  // Open AI site and wait for it to load

  await openAiSite(
    payload.platform,
    async () => {
      sourceInfo = payload.window;
      // Send extraction request to the content script in the AI tab
      void (await bridge.send({
        event: "extract-job-details",
        to: activeTab?.port as PortName,
        payload: payload.prompt,
      }));
    },
    false,
  );
});

/**
 * Checks for saved jobs and creates a notification if there are any that need applying.
 */
async function checkAndNotifySavedJobs() {
  try {
    const savedJobs = await getSavedJobs();
    if (savedJobs && savedJobs.length > 0) {
      const jobCount = savedJobs.length;
      const title = "ApplyMate Reminder";
      const message = `You have ${jobCount} saved job${jobCount > 1 ? "s" : ""} waiting for your application. Don't miss out!`;

      // 1. Internal app notification (shown in the extension's notification center)
      await addNotification({
        title: title,
        message: message,
        icon: "work",
        color: "primary",
        time: new Date().toISOString(),
        read: false,
      });

      // 2. System level notification
      void chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-128x128.png",
        title: title,
        message: message,
        priority: 2,
      });
    }
  } catch (error) {
    console.error("Error checking saved jobs for notifications:", error);
  }
}

// Set up the alarm to run every 2 hours (120 minutes)
const ALARM_NAME = "SAVED_JOBS_REMINDER";

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void checkAndNotifySavedJobs();
  }
});

// Create the alarm if it doesn't exist
chrome.alarms.get(ALARM_NAME, (alarm) => {
  if (!alarm) {
    void chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: 120, // 2 hours
      delayInMinutes: 120, // Start in 2 hours
    });
  }
});

// Optional: Run once on startup to ensure user is reminded if they haven't been in a while
// void checkAndNotifySavedJobs();
