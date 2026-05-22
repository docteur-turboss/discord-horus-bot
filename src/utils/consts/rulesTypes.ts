import { IC_LeftToRightMark, IC_RightToLeftMark } from "./invisiblesChars";

export const RULES_ACCEPT_TOPIC_MARKER = IC_LeftToRightMark + IC_RightToLeftMark;

export const getRulesAcceptTopic = (roleId: string, messageId: string) =>
  `rules:accept:${roleId}:${messageId} ${RULES_ACCEPT_TOPIC_MARKER}`;
