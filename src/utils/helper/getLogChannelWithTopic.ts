import { Collection, Guild, TextChannel } from "discord.js";
import { DASHBOARD_TOPIC, LOG_TOPICS } from "utils/consts/logTypes";

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

export const computeLogState = (channels: Collection<string, TextChannel>) => {
  return {
    hasRoleLog: !!findChannelByTopic(channels, LOG_TOPICS.roles),
    hasMessageLog: !!findChannelByTopic(channels, LOG_TOPICS.message),
    hasChannelLog: !!findChannelByTopic(channels, LOG_TOPICS.channels),
    hasModerationLog: !!findChannelByTopic(channels, LOG_TOPICS.moderation),
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