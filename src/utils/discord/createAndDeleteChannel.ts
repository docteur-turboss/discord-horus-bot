import { ButtonInteraction, ChannelType, Collection, TextChannel } from "discord.js";
import { findChannelByTopic } from "utils/helper/getLogChannelWithTopic";
import { LOG_TOPICS, LogType } from "utils/consts/logTypes";
import { TranslationKey } from "utils/locales/i18n.types";
import { t } from "utils/locales/i18n";

export const createLogChannel = async (
  interaction: ButtonInteraction,
  type: LogType
) => {
  const guild = interaction.guild!;
  const currentChannel = interaction.channel as TextChannel;

  return guild.channels.create({
    name: t(interaction, `embeds.logs.${type}` as TranslationKey),
    type: ChannelType.GuildText,
    parent: currentChannel.parentId ?? undefined,
    topic: `${LOG_TOPICS[type]} `,
  });
};

export const deleteLogChannel = async (
  channels: Collection<string, TextChannel>,
  type: LogType
) => {
  const channel = findChannelByTopic(channels, LOG_TOPICS[type]);
  if (!channel) return null;

  await channel.delete();
  return channel;
};