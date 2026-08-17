import { defineBoot } from "#q-app/wrappers";
import { getFontData } from "src/db";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot((/* { app, router, ... } */) => {
  const originalFetch = window.fetch;

  window.fetch = async function (url, options) {
    // Check if this is a font request
    if (typeof url === "string" && url.includes("fonts.applyMate.com")) {
      const urlObj = new URL(url);
      const fontId = urlObj.pathname.split("/").pop();
      const fontName = urlObj.searchParams.get("font-family");
      const fontBlob = await getFontData(fontName || "", fontId || "");
      // Return a fake Response with proper headers
      return new Response(fontBlob, {
        status: 200,
        headers: {
          "Content-Type": "font/ttf",
          "Content-Length": fontBlob?.size.toString() || "0",
        },
      });
    }

    // Otherwise, use the original fetch
    return originalFetch.call(this, url, options);
  };
});
