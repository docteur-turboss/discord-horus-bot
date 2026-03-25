import {
  Events,
  DMChannel,
  MessageFlags,
  NonThreadGuildBasedChannel,
} from "discord.js";
import {
  IC_ThinSpace,
} from "utils/consts/invisiblesChars";
import { 
  hasTopic, 
  computeLogState, 
  findChannelByTopic, 
  getTextChannelsWithTopic, 
} from "utils/helper/getLogChannelWithTopic";
import { ALL_LOG_MARKERS, DASHBOARD_TOPIC } from "utils/consts/logTypes";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { logger } from "utils/logger/logger";

export const data = {
  event: Events.ChannelDelete,
};

export const main = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  if (!channel || channel.isDMBased() || !channel.guild) return;
  if (!("topic" in channel)) return;

  try {
    const topic = channel.topic ?? "";
    if (!topic) return;

    const guild = channel.guild;

    const isManagedChannel = ALL_LOG_MARKERS.some(c => topic.includes(c));
    if (!isManagedChannel) return;

    const channels = getTextChannelsWithTopic(guild);

    if (topic.includes(IC_ThinSpace)) {
      const managed = channels.filter(ch =>
        ALL_LOG_MARKERS.some(c => hasTopic(ch, c))
      );

      await Promise.allSettled(managed.map(ch => ch.delete()));
      return;
    }

    const dashboard = findChannelByTopic(channels, DASHBOARD_TOPIC);
    if (!dashboard) return;

    const state = computeLogState(getTextChannelsWithTopic(guild));

    const lang = guild.preferredLocale.split("-")[0];
    const container = logPanelContainer({
      interaction: lang,
      ...state,
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