import { saveFont } from "src/db";

async function fetchFontAsBlob(url: string, fontName: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${fontName}: ${response.status}`);
  }
  return await response.blob();
}
export async function saveDefaultFonts() {
  const fontConfigs = [
    {
      name: "Arial Normal",
      url: chrome.runtime.getURL("assets/fonts/arial/ARIAL.TTF"),
      fileName: "ARIAL.TTF",
    },
    {
      name: "Arial Bold",
      url: chrome.runtime.getURL("assets/fonts/arial/ARIALBD.TTF"),
      fileName: "ARIALBD.TTF",
    },
    {
      name: "Arial Black Italic",
      url: chrome.runtime.getURL("assets/fonts/arial/ARIALBLACKITALIC.TTF"),
      fileName: "ARIALBLACKITALIC.TTF",
    },
    {
      name: "Arial Italic",
      url: chrome.runtime.getURL("assets/fonts/arial/ARIALI.TTF"),
      fileName: "ARIALI.TTF",
    },
  ];

  try {
    // Fetch all fonts in parallel
    const blobs = await Promise.all(
      fontConfigs.map((config) => fetchFontAsBlob(config.url, config.name)),
    );


    const [normalBlob, boldBlob, bItalicBlob, italicBlob] = blobs;
    const normalConfig = fontConfigs[0];
    const boldConfig = fontConfigs[1];
    const bItalicConfig = fontConfigs[2];
    const italicConfig = fontConfigs[3];

    if (!normalConfig || !boldConfig || !bItalicConfig || !italicConfig) {
      throw new Error("Missing required font configuration.");
    }

    if (!normalBlob || !boldBlob || !bItalicBlob || !italicBlob) {
      throw new Error("One or more font files could not be loaded.");
    }

    // Convert blobs to Files
    const normalFile = blobToFile(
      normalBlob,
      normalConfig.fileName,
      "font/ttf",
    );
    const boldFile = blobToFile(boldBlob, boldConfig.fileName, "font/ttf");
    const bItalicFile = blobToFile(
      bItalicBlob,
      bItalicConfig.fileName,
      "font/ttf",
    );
    const italicFile = blobToFile(
      italicBlob,
      italicConfig.fileName,
      "font/ttf",
    );

    // Call saveFont with the File objects
    await saveFont({
      name: "Arial",
      normal: normalFile,
      bold: boldFile,
      bolditalics: bItalicFile,
      italics: italicFile,
    });

    console.log("All fonts saved successfully!");

    // Return the files for potential further use
    return {
      normal: normalFile,
      bold: boldFile,
      bolditalics: bItalicFile,
      italics: italicFile,
    };
  } catch (error) {
    console.error("Failed to load and save fonts:", error);
    throw error;
  }
}

function blobToFile(blob: Blob, fileName: string, mimeType?: string): File {
  return new File([blob], fileName, {
    type: mimeType || blob.type || "application/octet-stream",
  });
}
