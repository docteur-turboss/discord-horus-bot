import {
  Events,
  NonThreadGuildBasedChannel,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DMChannel,
  MessageFlags,
} from "discord.js";
import {
  IC_ThinSpace,
  IC_ZeroWidthJoiner,
  IC_ZeroWidthNonJoiner,
  IC_ZeroWidthSpace,
} from "utils/consts/invisiblesChars";
import { logPanelContainer } from "utils/discord/logPanelContainer";
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

    const channels = guild.channels.cache.filter(ch => {
      if (!ch.isTextBased()) return false;
      if (!("topic" in ch)) return false;
      return true;
    })

    const hasMessageLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthSpace));
    const hasRoleLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthNonJoiner));
    const hasChannelLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthJoiner));
    
    const dashboard = channels.find((ch) => {
        if (!("topic" in ch)) return false;
        return ch.topic?.includes(IC_ThinSpace);
    }) as TextChannel | undefined;
    if (!dashboard) return;

    const lang = guild.preferredLocale.split("-")[0];
    const container = logPanelContainer({
      hasRoleLog,
      interaction: lang,
      hasChannelLog,
      hasMessageLog,
    });

    const messages = await dashboard.messages.fetch({ limit: 10 });
    const botMessage = messages.find(m => m.author.id === guild.members.me?.id);
    if (!botMessage) return dashboard.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    await botMessage.edit({
      components: [container],
    });

  } catch (error) {
    logger.error("Error in log system channel delete listener", error as Record<string, unknown>);
  }
};