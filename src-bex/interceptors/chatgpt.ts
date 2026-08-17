/* eslint-disable @typescript-eslint/no-explicit-any */
import { emitResponse } from "./main";

export function watchChatGPT() {
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
