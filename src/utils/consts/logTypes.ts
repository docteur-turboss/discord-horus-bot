import { Collection, Guild, TextChannel } from "discord.js";
import { IC_ThinSpace, IC_ZeroWidthJoiner, IC_ZeroWidthNonJoiner, IC_ZeroWidthSpace } from "./invisiblesChars";

export type LogType = "message" | "role" | "channel";

export const LOG_TOPICS: Record<LogType, string> = {
  message: IC_ZeroWidthSpace,
  role: IC_ZeroWidthNonJoiner,
  channel: IC_ZeroWidthJoiner,
};

export const DASHBOARD_TOPIC = IC_ThinSpace;

export const ALL_LOG_MARKERS = [
  DASHBOARD_TOPIC,
  ...Object.values(LOG_TOPICS),
];