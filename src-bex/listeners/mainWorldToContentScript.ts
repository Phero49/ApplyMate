/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BexBridge } from "@quasar/app-vite";
import { createNotification } from "../utils/notification";
import {
  currentSelector,
  dispatchEnter,
  fillInput,
} from "../utils/aiPageUtils";

let attempts = 3;

export const chatResponseReady = (
  event: MessageEvent,
  bridge: BexBridge,
  callback: (data: any, text?: string[]) => void,
) => {
  const parts = event.data.detail.text.split(/```(?:json)+/, 2);
  const secondPart = parts.length > 1 ? parts[1]?.split("```", 2) : null;
  const jsonString = secondPart?.[0] || (null as string | null);
  const noneCodeBlock = [parts[0], secondPart?.[1]];

  let json = {};
  console.log(jsonString, "trimed", jsonString.trim());

  try {
    const parsedJson = JSON.parse((jsonString || "{}").trim());
    json = parsedJson;

    callback(parsedJson, noneCodeBlock);
    // bridge.send({event:'responseFinished',to:'app',payload:{data:parsedJson,text:noneCodeBlock}})
  } catch (e) {
    onResponseError(e, bridge);
  }
  if (attempts === 0) {
    callback(json, noneCodeBlock);
    attempts = 3;
  }
};

function onResponseError(e: any, bridge: BexBridge) {
  if (attempts > 0) {
    const message = `an error occurred with the json block: ${e} 
  ----
  ###Tips ###
  the parser always assume the first json block is the resume json data also make sure you also provide a valid json 
  code block can be parsed with javascript json parser`;
    void fillInput(currentSelector, message);
    dispatchEnter(document.querySelector(currentSelector)!);
    const msg =
      "the model responded but an error occurred processing  the response attempting a try again ";
    if (bridge.portList.includes("app")) {
      void bridge.send({
        event: "responseError",
        to: "app",
        payload: msg,
      });
    }
    createNotification({ message: msg, type: "negative" });

    attempts--;
    return;
  } else {
    attempts = 3;
    void bridge.send({
      event: "communicationError",
      to: "app",
      payload: "Failed to get prompt in the right form after 3 attempts ",
    });
  }
}

export function onChunkResponse(event: MessageEvent, bridge: BexBridge) {
  const parts = event.data.detail.text.split(/```(?:json)+/, 2);
  const secondPart = parts.length > 1 ? parts[1]?.split("```", 2) : null;
  const jsonString = secondPart?.[0].trim() || null;
  const noneCodeBlock = [parts[0], secondPart?.[1]];
  let jsonCode = null;
  try {
    jsonCode = JSON.parse(jsonString);
  } catch {
    jsonCode = null;
  }
  if (!bridge.portList.includes("app")) {
    console.warn("apply mate  : app not found ");
    return;
  }
  void bridge.send({
    to: "app",
    event: "responseChunk",
    payload: { text: noneCodeBlock, Resume: jsonCode },
  });
}
