import { sendGAEvent } from "@next/third-parties/google";
// eslint-disable-next-line
export const trackEvent = (eventName: string, params:any )=> {
  sendGAEvent("event", eventName, params);
};
