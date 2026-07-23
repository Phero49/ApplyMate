import chatgptIcon from "../assets/chatgpt-icon.svg";
import deepseekIcon from "../assets/deepseek-logo-icon.svg";
import geminiIcon from "../assets/google-gemini-icon.svg";
import qwenIcon from "../assets/qwen-ai-icon.svg";
export function getAiPlatformIcon(url: string) {
  if (url.includes("chatgpt")) {
    return chatgptIcon;
  }
  if (url.includes("deepseek")) {
    return deepseekIcon;
  }
  if (url.includes("gemini")) {
    return geminiIcon;
  }
  if (url.includes("qwen")) {
    return qwenIcon;
  }
  return "";
}
