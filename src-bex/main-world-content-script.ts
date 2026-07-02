/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Main-world content script.
 *
 * Runs in the PAGE context so it can intercept XHR / fetch calls that are
 * inaccessible from the isolated content-script world.
 *
 * Adding support for a new provider:
 *   1. Write a `watch<Provider>()` function below.
 *   2. Register it in PROVIDER_WATCHERS with the postMessage type the
 *      content script will send (see my-content-script.ts → watchAiGeneration).
 *
 * Every watcher must emit `window.postMessage({ type: "chat-response-ready",
 * detail: { text: string } })` when the full response is assembled.
 */

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

/** Map of incoming postMessage type → watcher starter function */
const PROVIDER_WATCHERS: Record<string, () => void> = {
  "chat.deepseek.com": watchDeepSeek,
  "chat.qwen.ai": watchQwen,
  "chat.openai.com": watchChatGPT,
};

window.addEventListener("message", (event: MessageEvent) => {
  if (!event.data?.type) return;
  if (event.data?.type == "listenToAi") {
    const watcher = PROVIDER_WATCHERS[location.hostname];
    if (watcher) watcher();
  }
});

// ---------------------------------------------------------------------------
// Shared helper — emit the assembled response back to the content-script world
// ---------------------------------------------------------------------------

function emitResponse(text: string, raw?: unknown) {
  window.postMessage(
    { type: "chat-response-ready", detail: { text, raw } },
    location.origin,
  );
}

// ---------------------------------------------------------------------------
// DeepSeek — XHR streaming interceptor (/v0/chat/completion)
// ---------------------------------------------------------------------------

function watchDeepSeek() {
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

// ---------------------------------------------------------------------------
// Qwen — fetch interceptor
// ---------------------------------------------------------------------------

function watchQwen() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [url, options] = args;
    const response = await originalFetch.apply(this, args);

    if (typeof url === "string" && url.includes("chat/completions")) {
      // Check if it's a streaming request
      const isStreaming =
        options?.body &&
        typeof options.body === "string" &&
        JSON.parse(options.body)?.stream === true;

      if (isStreaming && response.body) {
        // Clone the response so we can read it without affecting the original
        const clonedResponse = response.clone();
        const reader = clonedResponse.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        // Read and process the stream without interfering with the original
        void (async () => {
          try {
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed?.choices?.[0]?.delta?.content;
                    if (delta && delta !== "") {
                      fullText += delta;
                      emitResponse(delta, parsed);
                    }

                    if (parsed?.choices?.[0]?.delta?.status === "finished") {
                      emitResponse(fullText, parsed);
                    }
                  } catch (err) {
                    console.error("[Qwen] SSE parse error:", err);
                  }
                }
              }
            }
          } catch (err) {
            console.error("[Qwen] Stream read error:", err);
          }
        })();

        // Return the original response untouched
        return response;
      } else {
        // Handle non-streaming response
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();

          const text: string =
            data?.choices?.[0]?.message?.content ??
            data?.output?.text ??
            JSON.stringify(data);

          emitResponse(text, data);
        } catch (err) {
          console.error("[Qwen] fetch parse error:", err);
        }
      }
    }

    return response;
  };
}

function watchChatGPT() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [url, options] = args;
    const response = await originalFetch.apply(this, args);

    if (typeof url === "string" && url.includes("backend-api/f/conversation")) {
      // Check if it's a streaming request (likely always true for this endpoint)
      const isStreaming =
        options?.body &&
        typeof options.body === "string" &&
        JSON.parse(options.body)?.stream === true;

      if (isStreaming && response.body) {
        // Clone the response so we can read it without affecting the original
        const clonedResponse = response.clone();
        const reader = clonedResponse.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        // Read and process the stream without interfering with the original
        void (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // Keep the last incomplete chunk

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Handle event lines
                if (line!.startsWith("event: ")) {
                  const eventType = line!.slice(7);
                  // Look ahead for the data line
                  const nextLine = lines[i + 1];
                  if (nextLine && nextLine.startsWith("data: ")) {
                    const data = nextLine.slice(6);

                    if (eventType === "delta" && data !== "[DONE]") {
                      try {
                        const parsed = JSON.parse(data);

                        // Handle different delta formats
                        let deltaText = "";

                        // Format 1: {"v": "text"} (direct append)
                        if (parsed.v && typeof parsed.v === "string") {
                          deltaText = parsed.v;
                        }
                        // Format 2: {"p": "/message/content/parts/0", "o": "append", "v": "text"}

                        // Format 3: Nested in v with patches
                        else if (parsed.v && Array.isArray(parsed.v)) {
                          for (const patch of parsed.v) {
                            if (
                              patch.o === "append" &&
                              patch.v &&
                              typeof patch.v === "string"
                            ) {
                              deltaText += patch.v;
                            }
                          }
                        }

                        if (deltaText) {
                          fullText += deltaText;
                          emitResponse(deltaText, parsed);
                        }

                        // Check for completion
                        if (parsed.v && Array.isArray(parsed.v)) {
                          const hasFinished = parsed.v.some(
                            (patch: any) =>
                              patch.o === "replace" &&
                              patch.p === "/message/status" &&
                              patch.v === "finished_successfully",
                          );
                          if (hasFinished) {
                            emitResponse(fullText, parsed);
                          }
                        }
                      } catch (err) {
                        console.error("[ChatGPT] SSE parse error:", err);
                      }
                    }
                    i++; // Skip the data line we already processed
                  }
                }

                // Handle data lines without event prefix (fallback)
                if (line!.startsWith("data: ")) {
                  const data = line!.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);

                    // Handle message_marker for first token
                    if (
                      parsed.type === "message_marker" &&
                      parsed.marker === "user_visible_token"
                    ) {
                      console.log("[ChatGPT] First token marker received");
                    }

                    // Handle delta from server_ste_metadata or other types
                    if (
                      parsed.type === "delta" &&
                      parsed.v &&
                      typeof parsed.v === "string"
                    ) {
                      fullText += parsed.v;
                      emitResponse(parsed.v, parsed);
                    }

                    // Check for completion
                    if (parsed.type === "message_stream_complete") {
                      emitResponse(fullText, parsed);
                    }
                  } catch (err) {
                    console.error("[ChatGPT] Data parse error:", err);
                  }
                }
              }
            }
          } catch (err) {
            console.error("[ChatGPT] Stream read error:", err);
          }
        })();

        // Return the original response untouched
        return response;
      } else {
        // Handle non-streaming response
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          const text =
            data?.message?.content?.parts?.[0] ?? JSON.stringify(data);
          emitResponse(text, data);
        } catch (err) {
          console.error("[ChatGPT] fetch parse error:", err);
        }
      }
    }

    return response;
  };
}
