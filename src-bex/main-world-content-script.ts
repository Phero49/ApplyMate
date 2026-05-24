/* eslint-disable @typescript-eslint/no-explicit-any */
// DeepSeek stream interceptor (fetch-based)
// Listens for full assembled chat and emits a final event

window.addEventListener("message", (event) => {
  console.log(event, event.data);
  if (event.data.type == "watchChatDeepSeekResponse") {
    watchChatDeepSeekResponse();
  }
});

function watchChatDeepSeekResponse() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalOpen = XMLHttpRequest.prototype.open;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalSend = XMLHttpRequest.prototype.send;

  // persistent chat state per request
  let activeChat = {
    fragments: [] as string[],
    finished: false,
  };

  function resetChat() {
    activeChat = {
      fragments: [],
      finished: false,
    };
  }

  function emitFinalChat() {
    const fullText = activeChat.fragments.join("");

    window.postMessage({
      type: "deepseek-chat-ready",
      detail: {
        text: fullText,
        raw: activeChat,
      },
    });

    console.log("deepseek-chat-ready", {
      text: fullText,
      raw: activeChat,
    });

    resetChat();
  }

  function applyChunk(data: any) {
    // initial full structure
    if (data?.v?.response?.fragments) {
      activeChat.fragments = data.v.response.fragments.map(
        (f: any) => f.content || "",
      );
    }

    // incremental append patch
    if (data?.p === "response/fragments/-1/content" && data?.o === "APPEND") {
      const last = activeChat.fragments.length - 1;

      if (last >= 0) {
        activeChat.fragments[last] += data.v;
      }
    }

    // raw token chunks
    if (typeof data?.v === "string") {
      const last = activeChat.fragments.length - 1;

      if (last >= 0) {
        activeChat.fragments[last] += data.v;
      }
    }

    // finish signals
    if (
      data?.v?.quasi_status === "FINISHED" ||
      (data?.p === "response/status" && data?.v === "FINISHED")
    ) {
      activeChat.finished = true;
      emitFinalChat();
    }
  }

  // intercept open()
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    // store metadata on xhr instance
    (this as any)._deepseekUrl = String(url);
    (this as any)._deepseekMethod = method;

    // eslint-disable-next-line prefer-rest-params
    return originalOpen.apply(this, arguments as any);
  };

  // intercept send()
  XMLHttpRequest.prototype.send = function (
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const xhr = this as XMLHttpRequest & {
      _deepseekUrl?: string;
      _deepseekMethod?: string;
    };

    const url = xhr._deepseekUrl || "";

    const isTarget = url.endsWith("/v0/chat/completion");

    // console.log("XHR:", xhr._deepseekMethod, url, isTarget);

    if (isTarget) {
      let lastProcessedLength = 0;

      xhr.addEventListener("readystatechange", () => {
        try {
          // streaming state
          if (
            xhr.readyState === XMLHttpRequest.LOADING ||
            xhr.readyState === XMLHttpRequest.DONE
          ) {
            const responseText = xhr.responseText || "";

            // get only newly received chunk
            const newChunk = responseText.slice(lastProcessedLength);

            lastProcessedLength = responseText.length;

            if (!newChunk) return;

            // SSE parsing
            const lines = newChunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;

              const raw = line.replace("data:", "").trim();

              if (!raw) continue;

              try {
                const json = JSON.parse(raw);

                //  console.log("deepseek chunk:", json);

                applyChunk(json);
              } catch (err) {
                console.log("malformed chunk", raw, err);
              }
            }
          }
        } catch (err) {
          console.error("XHR parse error:", err);
        }
      });

      xhr.addEventListener("error", (err) => {
        console.error("XHR failed:", err);
      });
    }

    return originalSend.apply(this, arguments as any);
  };
}
