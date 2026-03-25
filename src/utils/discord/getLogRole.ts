import { Guild, TextChannel } from "discord.js";
import { getTextChannelsWithTopic, findChannelByTopic } from "utils/helper/getLogChannelWithTopic";
import { LOG_TOPICS } from "utils/consts/logTypes";

export const getLogRole = (guild: Guild) => {
  return findChannelByTopic(
    getTextChannelsWithTopic(guild),
    LOG_TOPICS.role
  ) as TextChannel | null;
};