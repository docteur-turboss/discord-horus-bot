import { AuditLogEvent, DMChannel, Events, NonThreadGuildBasedChannel, TextChannel } from "discord.js";
import { logger } from "utils/logger/logger";
import {
  IC_InvisibleSeparator,
  IC_ZeroWidthNonJoiner,
  IC_NonBreakinSpace,
  IC_ThreePerEmSpace,
  IC_ZeroWidthJoiner,
  IC_LeftToRightMark,
  IC_RightToLeftMark,
  IC_ZeroWidthSpace,
  IC_FourPerEmSpace,
  IC_ByteOrderMark,
  IC_InvisiblePlus,
  IC_SixPerEmSpace,
  IC_WordJoiner,
  IC_HairSpace,
  IC_ThinSpace
} from "utils/consts/invisiblesChars";

export const data = {
  event: Events.ChannelUpdate,
};

const INVISIBLE_CHARS = [
  IC_InvisibleSeparator,
  IC_ZeroWidthNonJoiner,
  IC_NonBreakinSpace,
  IC_ThreePerEmSpace,
  IC_ZeroWidthJoiner,
  IC_LeftToRightMark,
  IC_RightToLeftMark,
  IC_ZeroWidthSpace,
  IC_FourPerEmSpace,
  IC_ByteOrderMark,
  IC_InvisiblePlus,
  IC_SixPerEmSpace,
  IC_WordJoiner,
  IC_HairSpace,
  IC_ThinSpace
];

export const main = async (
  oldChannel: DMChannel | NonThreadGuildBasedChannel, 
  newChannel: DMChannel | NonThreadGuildBasedChannel
) => {
  try {
    if (!oldChannel || !newChannel) return;
    if (!newChannel.isTextBased() || !oldChannel.isTextBased()) return;
    if (!("topic" in newChannel) || !("topic" in oldChannel)) return;

    const oldTopic = oldChannel.topic ?? "";
    const newTopic = newChannel.topic ?? "";

    if (oldTopic === newTopic) return;

    const guild = newChannel.guild;
    if (!guild) return;

    const logs = await guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelUpdate,
      limit: 5
    });

    const entry = logs.entries.find(e => e.targetId === newChannel.id);
    if (!entry) return;

    const executor = entry.executor;
    if (executor?.id === guild.members.me?.id) return;

    const hadInvisible = INVISIBLE_CHARS.some(char => oldTopic.includes(char));
    const stillHasInvisible = INVISIBLE_CHARS.some(char => newTopic.includes(char));

    if (!hadInvisible) return;
    if (stillHasInvisible) return;

    const lostChar = INVISIBLE_CHARS.find(char => oldTopic.includes(char));
    if (!lostChar) return;

    const updatedTopic = newTopic + lostChar;

    await (newChannel as TextChannel).setTopic(updatedTopic);

  } catch (error) {
    logger.error("Error in topic protection (channel update)", error as Record<string, unknown>);
  }
};