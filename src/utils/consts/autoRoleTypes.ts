import { IC_HairSpace, IC_InvisiblePlus } from "./invisiblesChars";

export const AUTO_ROLE_TOPIC_MARKER = IC_HairSpace + IC_InvisiblePlus;

export const getAutoRoleTopic = (roleId: string) =>
  `auto-role ${AUTO_ROLE_TOPIC_MARKER} ${roleId}`;
