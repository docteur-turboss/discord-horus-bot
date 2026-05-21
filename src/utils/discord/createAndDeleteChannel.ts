import { ButtonInteraction, ChannelSelectMenuInteraction, ChannelType, Collection, PermissionsBitField, TextChannel, VoiceChannel } from "discord.js";
import { findChannelByTopic, findLogChannel } from "utils/helper/getLogChannelWithTopic";
import { LOG_TOPICS, LogType } from "utils/consts/logTypes";
import { TMP_VOICE_DASHBOARD_TOPIC_MARKER, getTmpVoiceDashboardTopic } from "utils/consts/tmpVoiceTypes";
import { TranslationKey } from "utils/locales/i18n.types";
import { t } from "utils/locales/i18n";
import { tmpVoiceManager } from "./tmpVoiceManager";

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
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      }
    ],
    topic: `${LOG_TOPICS[type]} `,
  });
};

export const deleteLogChannel = async (
  channels: Collection<string, TextChannel>,
  type: LogType
) => {
  const channel = findLogChannel(channels, LOG_TOPICS[type]);
  if (!channel) return null;

  await channel.delete();
  return channel;
};

export const createTmpVoiceTextChannel = async (
  interaction: ButtonInteraction | ChannelSelectMenuInteraction,
  trackedVoiceChannelId: string
) => {
  const guild = interaction.guild!;
  const currentChannel = interaction.channel as TextChannel;

  return guild.channels.create({
    name: "tmp-voice",
    type: ChannelType.GuildText,
    parent: currentChannel.parentId ?? undefined,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      }
    ],
    topic: getTmpVoiceDashboardTopic() + trackedVoiceChannelId,
  });
};

export const deleteTmpVoiceTextChannel = async (
  channels: Collection<string, TextChannel>
) => {
  const channel = findChannelByTopic(channels, TMP_VOICE_DASHBOARD_TOPIC_MARKER);
  if (!channel) return null;

  const topic = channel.topic ?? "";
  const trackedId = topic.replace(getTmpVoiceDashboardTopic(), "").trim();

  await channel.delete();

  if (trackedId) {
    const voiceChannel = channel.guild.channels.cache.get(trackedId) as VoiceChannel | undefined;
    if (voiceChannel) {
      const webhook = await tmpVoiceManager.findBotWebhook(voiceChannel);
      if (webhook) await webhook.delete().catch(() => null);
      await voiceChannel.delete().catch(() => null);
    }
    tmpVoiceManager.removeTracked(trackedId);
  }

  return channel;
};
