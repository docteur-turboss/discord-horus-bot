import { IC_InvisibleSeparator, IC_ThinSpace, IC_ZeroWidthJoiner, IC_ZeroWidthNonJoiner, IC_ZeroWidthSpace,  } from "./invisiblesChars";

export type LogType = "message" | "roles" | "channels" | "moderation";

export const LOG_TOPICS: Record<LogType, string> = {
  message: IC_ZeroWidthSpace,
  roles: IC_ZeroWidthNonJoiner,
  channels: IC_ZeroWidthJoiner,
  moderation: IC_InvisibleSeparator,
};

export const DASHBOARD_TOPIC = IC_ThinSpace;

export const ALL_LOG_MARKERS = [
  DASHBOARD_TOPIC,
  ...Object.values(LOG_TOPICS),
];