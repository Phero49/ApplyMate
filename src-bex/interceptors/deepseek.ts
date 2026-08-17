/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// DeepSeek — XHR streaming interceptor (/v0/chat/completion)
// ---------------------------------------------------------------------------

import { emitResponse, emitResponseChunk } from "./main";

export function watchDeepSeek() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalOpen = XMLHttpRequest.prototype.open;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalSend = XMLHttpRequest.prototype.send;

  let activeChat = { fragments: [] as string[], finished: false };

  function resetChat() {
    activeChat = { fragments: [], finished: false };
  }

  function applyChunk(data: any) {
    // Initial full structure
    if (data?.v?.response?.fragments) {
      activeChat.fragments = data.v.response.fragments.map(
        (f: any) => f.content || "",
      );
    }

    // Incremental append patch
    if (data?.p === "response/fragments/-1/content" && data?.o === "APPEND") {
      const last = activeChat.fragments.length - 1;
      if (last >= 0) activeChat.fragments[last] += data.v;
    }

    // Raw token chunks
    if (typeof data?.v === "string") {
      const last = activeChat.fragments.length - 1;
      if (last >= 0) activeChat.fragments[last] += data.v;
    }

    emitResponseChunk(activeChat.fragments.join(""), activeChat);

    // Finish signals
    if (
      data?.v?.quasi_status === "FINISHED" ||
      (data?.p === "response/status" && data?.v === "FINISHED")
    ) {
      activeChat.finished = true;
      emitResponse(activeChat.fragments.join(""), activeChat);
      resetChat();
    }
  }

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
    (this as any)._interceptedUrl = String(url);
    // eslint-disable-next-line prefer-rest-params
    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function () {
    const xhr = this as XMLHttpRequest & { _interceptedUrl?: string };
    const isTarget = (xhr._interceptedUrl ?? "").endsWith(
      "/v0/chat/completion",
    );

    if (isTarget) {
      let lastProcessedLength = 0;

      xhr.addEventListener("readystatechange", () => {
        try {
          if (
            xhr.readyState === XMLHttpRequest.LOADING ||
            xhr.readyState === XMLHttpRequest.DONE
          ) {
            const responseText = xhr.responseText || "";
            const newChunk = responseText.slice(lastProcessedLength);
            lastProcessedLength = responseText.length;
            if (!newChunk) return;

            for (const line of newChunk.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const raw = line.replace("data:", "").trim();
              if (!raw) continue;
              try {
                applyChunk(JSON.parse(raw));
              } catch (err) {
                console.warn("[DeepSeek] malformed chunk", raw, err);
              }
            }
          }
        } catch (err) {
          console.error("[DeepSeek] XHR parse error:", err);
        }
      });

      xhr.addEventListener("error", (err) =>
        console.error("[DeepSeek] XHR failed:", err),
      );
    }

    // eslint-disable-next-line prefer-rest-params
    return originalSend.apply(this, arguments as any);
  };
}
