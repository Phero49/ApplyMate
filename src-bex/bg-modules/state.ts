export const states = {
  PreviousActiveTab: {} as chrome.tabs.Tab,
  currentActiveTab: {} as chrome.tabs.Tab,
  activeTabWithPort: null as { url: string; port: string; id: number } | null,
  communicateWithAiTab: false
};
    