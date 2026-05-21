import { IC_InvisibleSeparator, IC_ThinSpace, IC_ZeroWidthJoiner, IC_ZeroWidthNonJoiner, IC_ZeroWidthSpace } from "./invisiblesChars";

export const TMP_VOICE_WEBHOOK_NAME = "HorusTmpVoice";
export const TMP_VOICE_CATEGORY_NAME = "tmpVoiceMarker";

export const TMP_VOICE_TOPIC_MARKER = IC_ZeroWidthSpace + IC_ZeroWidthNonJoiner + IC_ZeroWidthJoiner;

export const TMP_VOICE_DASHBOARD_TOPIC_MARKER = IC_InvisibleSeparator + IC_ThinSpace;

export const getTmpVoiceDashboardTopic = () =>
  `tmp-voice-dashboard ${TMP_VOICE_DASHBOARD_TOPIC_MARKER}`;

export const getTmpVoiceTrackedTopic = (channelId: string) =>
  `tmp-voice-tracked ${channelId} ${TMP_VOICE_TOPIC_MARKER}`;
