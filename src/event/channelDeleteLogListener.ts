import {
  Events,
  NonThreadGuildBasedChannel,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DMChannel,
} from "discord.js";
import {
  IC_ThinSpace,
  IC_ZeroWidthJoiner,
  IC_ZeroWidthNonJoiner,
  IC_ZeroWidthSpace,
} from "utils/consts/invisiblesChars";
import { logger } from "utils/logger/logger";

export const data = {
  event: Events.ChannelDelete,
};

const LOG_CHAR_MAP = {
  [IC_ZeroWidthJoiner]: "channel",
  [IC_ZeroWidthNonJoiner]: "role",
  [IC_ZeroWidthSpace]: "message",
};

export const main = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  if (!channel || channel.isDMBased() || !channel.guild) return;

  try {
    if (!("topic" in channel)) return;

    const topic = channel.topic ?? "";
    if (!topic) return;

    const guild = channel.guild;

    const hasInvisible = [
      IC_ThinSpace,
      IC_ZeroWidthJoiner,
      IC_ZeroWidthNonJoiner,
      IC_ZeroWidthSpace,
    ].some(char => topic.includes(char));

    if (!hasInvisible) return;

    if (topic.includes(IC_ThinSpace)) {
      const channels = guild.channels.cache.filter((ch) => {
        if (!ch.isTextBased()) return false;
        if (!("topic" in ch)) return false;

        return [
          IC_ThinSpace,
          IC_ZeroWidthJoiner,
          IC_ZeroWidthNonJoiner,
          IC_ZeroWidthSpace,
        ].some(c => ch.topic?.includes(c));
      });

      for (const [, ch] of channels) {
        await ch.delete().catch(() => null);
      }

      return;
    }

    const typeEntry = Object.entries(LOG_CHAR_MAP).find(([char]) =>
      topic.includes(char)
    );

    if (!typeEntry) return;

    const [, type] = typeEntry;

    const dashboard = guild.channels.cache.find((ch) => {
      if (!ch.isTextBased()) return false;
      if (!("topic" in ch)) return false;

      return ch.topic?.includes(IC_ThinSpace);
    }) as TextChannel | undefined;
    if (!dashboard) return;

    const messages = await dashboard.messages.fetch({ limit: 10 });
    const botMessage = messages.find(m => m.author.id === guild.members.me?.id);

    if (!botMessage) return;

    const disabledStyle = ButtonStyle.Secondary;

    //
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("log_message_toggle")
        .setLabel("Messages")
        .setStyle(type === "message" ? disabledStyle : ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("log_roles_toggle")
        .setLabel("Roles")
        .setStyle(type === "role" ? disabledStyle : ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("log_channels_toggle")
        .setLabel("Channels")
        .setStyle(type === "channel" ? disabledStyle : ButtonStyle.Success),
    );

    await botMessage.edit({
      components: [row],
    });

  } catch (error) {
    logger.error("Error in log system channel delete listener", error as Record<string, unknown>);
  }
};