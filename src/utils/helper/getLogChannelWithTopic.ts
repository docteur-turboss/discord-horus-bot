import { Collection, Guild, TextChannel } from "discord.js";
import { DASHBOARD_TOPIC, LOG_TOPICS } from "utils/consts/logTypes";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { AUTO_ROLE_TOPIC_MARKER } from "utils/consts/autoRoleTypes";

export const getTextChannelsWithTopic = (guild: Guild) => {
  return guild.channels.cache.filter(
    (ch): ch is TextChannel =>
      ch.isTextBased() && "topic" in ch
  );
};

export const hasTopic = (ch: TextChannel, value: string) =>
  ch.topic?.includes(value);

export const findChannelByTopic = (channels: Collection<string, TextChannel>, topic: string) => {
  return channels.find(ch => ch.topic?.includes(topic));
};

export const findChannelsByTopic = (channels: Collection<string, TextChannel>, topic: string) => {
  return channels.filter(ch => ch.topic?.includes(topic));
};

export const findLogChannel = (channels: Collection<string, TextChannel>, marker: string) =>
  channels.find(ch => ch.topic?.startsWith(marker));

export const computeLogState = (channels: Collection<string, TextChannel>, guildId: string) => {
  return {
    hasRoleLog: !!findLogChannel(channels, LOG_TOPICS.roles),
    hasMessageLog: !!findLogChannel(channels, LOG_TOPICS.message),
    hasChannelLog: !!findLogChannel(channels, LOG_TOPICS.channels),
    hasModerationLog: !!findLogChannel(channels, LOG_TOPICS.moderation),
    hasTmpVoice: tmpVoiceManager.getTrackedChannels(guildId).length > 0,
    hasAutoRole: !!findChannelByTopic(channels, AUTO_ROLE_TOPIC_MARKER),
  };
};

export const findDashboardChannel = async (guild: Guild, channels: Collection<string, TextChannel>) => {
  const existing = channels.find(ch => hasTopic(ch, DASHBOARD_TOPIC));
  if (!existing) return null;

  const messages = await existing.messages.fetch({ limit: 10 });

  const botMessage = messages.find(m =>
    m.author.id === guild.members.me?.id &&
    m.components.length > 0
  );

  return botMessage ? "ALREADY_EXISTS" : existing;
};

export const findDashboardChannelByGuild = (guild: Guild) => {
  const channels = getTextChannelsWithTopic(guild);
  return channels.find(ch => hasTopic(ch, DASHBOARD_TOPIC)) ?? null;
};
