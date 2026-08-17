import { emitResponse, emitResponseChunk } from "./main";

/**
 * Qwen fetch interceptor
 *
 * This function intercepts all fetch requests to Qwen's chat completions API
 * and extracts the streaming response text WITHOUT interfering with the
 * original response that Qwen receives.
 *
 * WHY THIS IS NECESSARY:
 * Qwen uses Server-Sent Events (SSE) for streaming responses. Unlike a
 * regular JSON response where you get everything at once, SSE sends the
 * response as a series of "data: {...}" chunks over time. Each chunk
 * contains a small piece of the response (a "delta").
 *
 * WHY WE CLONE THE RESPONSE:
 * A fetch Response object can only be consumed once. If we read the body
 * stream, Qwen wouldn't be able to read it - breaking the application.
 * By cloning, we create a separate stream that we can read without
 * affecting the original response that Qwen will consume.
 *
 * WHY WE USE VOID (async () => {...})():
 * We process the cloned stream asynchronously in the background so it
 * doesn't block the main thread. Qwen gets its response immediately while
 * we process our copy in parallel.
 */
export function watchQwen() {
  // Store the original fetch function so we can call it later
  const originalFetch = window.fetch;

  /**
   * Replace the global fetch with our interceptor
   *
   * We use `...args` to preserve all arguments (url, options, etc.)
   * and call the original fetch with the same arguments.
   */
  window.fetch = async function (...args) {
    const [url, options] = args;

    // Call the original fetch first - Qwen MUST get the response
    const response = await originalFetch.apply(this, args);

    /**
     * Only intercept requests to Qwen's chat completions endpoint
     *
     * WHY URL CHECK:
     * We only care about chat completions. Other requests (like auth,
     * static assets, etc.) should pass through untouched.
     */
    if (typeof url === "string" && url.includes("chat/completions")) {
      /**
       * Determine if this is a streaming request
       *
       * WHY CHECK THE BODY:
       * Qwen uses `stream: true` in the request body to enable SSE.
       * Non-streaming requests return the full response in one JSON blob.
       *
       * WHY PARSE THE BODY:
       * We need to peek at the request body to check the `stream` flag.
       * The body is a JSON string, so we parse it to check the property.
       */
      const isStreaming =
        options?.body &&
        typeof options.body === "string" &&
        JSON.parse(options.body)?.stream === true;

      if (isStreaming && response.body) {
        /**
         * --- STREAMING RESPONSE HANDLER ---
         *
         * The response comes as a stream of SSE messages like:
         *
         * data: {"choices": [{"delta": {"content": "No"}}]}
         * data: {"choices": [{"delta": {"content": " problem"}}]}
         * data: {"choices": [{"delta": {"status": "finished"}}]}
         *
         * Each chunk contains a tiny piece of the response.
         * We need to accumulate these pieces to get the full message.
         */

        // Clone the response so we can read it without affecting the original
        const clonedResponse = response.clone();

        /**
         * Get the stream reader and text decoder
         *
         * WHY getReader():
         * Response.body is a ReadableStream. We need a reader to pull
         * chunks of data from it.
         *
         * WHY TextDecoder():
         * The stream comes as bytes. We decode it to text so we can
         * parse the SSE messages.
         */
        const reader = clonedResponse.body?.getReader();
        const decoder = new TextDecoder();

        // Accumulate the full response text across all chunks
        let fullText = "";

        /**
         * Process the stream in the background
         *
         * WHY void (async () => {...})():
         * We don't need to await this - it runs independently.
         * Qwen gets the original response immediately, while we
         * process our clone in the background.
         *
         * This is a "fire and forget" async operation.
         */
        void (async () => {
          try {
            /**
             * Read from the stream until it's done
             *
             * The stream sends data in chunks. Each chunk might contain
             * multiple SSE messages or partial messages. We read until
             * the stream is complete (done === true).
             */
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;

              /**
               * Decode the binary chunk to text
               *
               * The stream sends data as Uint8Array bytes. We decode it
               * to a string so we can parse the SSE messages.
               */
              const chunk = decoder.decode(value);

              /**
               * Split by newlines to get individual SSE messages
               *
               * SSE messages are separated by newlines. Each message
               * starts with "data: " followed by JSON.
               *
               * Example:
               * data: {"choices": [{"delta": {"content": "No"}}]}
               *
               * There might also be empty lines or multiple messages
               * in one chunk, so we split and process each line.
               */
              const lines = chunk.split("\n");

              for (const line of lines) {
                /**
                 * Only process lines that start with "data: "
                 *
                 * Ignore empty lines, event lines, or other metadata.
                 * The actual content is always after "data: ".
                 */
                if (line.startsWith("data: ")) {
                  /**
                   * Extract the JSON data
                   *
                   * Remove the "data: " prefix to get the raw JSON string.
                   * Example: "data: {\"choices\": [...]}" -> "{\"choices\": [...]}"
                   */
                  const data = line.slice(6);

                  /**
                   * Skip the [DONE] marker
                   *
                   * Some SSE implementations send a final [DONE] message
                   * to indicate the stream is complete. We skip it.
                   */
                  if (data === "[DONE]") continue;

                  try {
                    /**
                     * Parse the JSON data
                     *
                     * The data is a JSON object containing the response
                     * chunk. For streaming, Qwen uses a specific structure:
                     *
                     * {
                     *   choices: [{
                     *     delta: {
                     *       content: "text chunk",
                     *       status: "typing" | "finished"
                     *     }
                     *   }]
                     * }
                     */
                    const parsed = JSON.parse(data);

                    /**
                     * Extract the delta content
                     *
                     * `choices[0].delta.content` contains the incremental
                     * text for this chunk. If it exists and isn't empty,
                     * we add it to our accumulated full text and emit it.
                     *
                     * WHY CHAINED OPTIONAL CHAINING:
                     * Safely access nested properties without crashing if
                     * any intermediate property is undefined.
                     */
                    const delta = parsed?.choices?.[0]?.delta?.content;
                    if (delta && delta !== "") {
                      fullText += delta;
                      /**
                       * Emit the incremental chunk
                       *
                       * Other parts of the app can listen to these
                       * events to show streaming text in real-time.
                       */
                      emitResponseChunk(delta, parsed);
                    }

                    /**
                     * Check if the stream is finished
                     *
                     * Qwen sends a final message with status: "finished"
                     * when the response is complete. We emit the full
                     * accumulated text so the consumer knows it's done.
                     *
                     * WHY EMIT THE FULL TEXT:
                     * The consumer might want to know when the stream
                     * is complete. This gives them a final event with
                     * the complete response.
                     */
                    if (parsed?.choices?.[0]?.delta?.status === "finished") {
                      emitResponse(fullText, parsed);
                    }
                  } catch (err) {
                    /**
                     * Handle JSON parsing errors gracefully
                     *
                     * Sometimes the SSE message might be malformed or
                     * contain non-JSON data. We log the error but don't
                     * crash the stream.
                     */
                    console.error("[Qwen] SSE parse error:", err);
                  }
                }
              }
            }
          } catch (err) {
            console.error("[Qwen] Stream read error:", err);
          }
        })();

        /**
         * Return the ORIGINAL response untouched
         *
         * This is the most important part! We must return the original
         * response so Qwen can consume it. We've only processed a clone
         * in the background, so the original stream is still intact.
         */
        return response;
      } else {
        /**
         * --- NON-STREAMING RESPONSE HANDLER ---
         *
         * If the request doesn't have `stream: true`, Qwen returns a
         * single JSON response with the complete message.
         *
         * Example:
         * {
         *   choices: [{
         *     message: {
         *       content: "Full response text"
         *     }
         *   }]
         * }
         *
         * We can just read the JSON and emit the full text.
         */
        try {
          /**
           * Clone the response and parse it as JSON
           *
           * Even for non-streaming, we clone to be safe. The original
           * response will still be returned to Qwen.
           */
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();

          /**
           * Extract the text from various possible formats
           *
           * Different Qwen API versions might use different structures.
           * We try multiple common formats:
           *
           * 1. Standard OpenAI-compatible: choices[0].message.content
           * 2. Qwen's format: output.text
           * 3. Fallback: just stringify the whole response
           */
          const text: string =
            data?.choices?.[0]?.message?.content ??
            data?.output?.text ??
            JSON.stringify(data);

          /**
           * Emit the complete response
           *
           * For non-streaming, we emit the full text immediately.
           * The consumer knows this is the complete response.
           */
          emitResponse(text, data);
        } catch (err) {
          console.error("[Qwen] fetch parse error:", err);
        }
      }
    }

    /**
     * Always return the original response
     *
     * Regardless of whether we intercepted the request or not, we must
     * return the original response so the application continues working
     * normally.
     */
    return response;
  };
}
