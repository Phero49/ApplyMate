// ---------------------------------------------------------------------------
// Shared helper — emit the assembled response back to the content-script world
// ---------------------------------------------------------------------------

export function emitResponse(text: string, raw?: unknown) {
  window.postMessage(
    { type: "chat-response-ready", detail: { text, raw } },
    location.origin,
  );
}
/**
 * emit chunks not full response
 */
export function emitResponseChunk(text: string, raw?: unknown) {
  window.postMessage(
    { type: "chat-response-chunk", detail: { text, raw } },
    location.origin,
  );
}
