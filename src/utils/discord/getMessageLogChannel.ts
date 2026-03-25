import { Guild, TextChannel } from "discord.js";
import { getTextChannelsWithTopic, findChannelByTopic } from "utils/helper/getLogChannelWithTopic";
import { LOG_TOPICS } from "utils/consts/logTypes";

export const getMessageLogChannel = (guild: Guild) => {
  return findChannelByTopic(
    getTextChannelsWithTopic(guild),
    LOG_TOPICS.message
  ) as TextChannel | null;
};