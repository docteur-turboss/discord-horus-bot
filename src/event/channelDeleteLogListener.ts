import {
  Events,
  DMChannel,
  MessageFlags,
  NonThreadGuildBasedChannel,
} from "discord.js";
import { 
  hasTopic, 
  computeLogState, 
  findChannelByTopic, 
  getTextChannelsWithTopic, 
} from "utils/helper/getLogChannelWithTopic";
import { ALL_LOG_MARKERS, DASHBOARD_TOPIC } from "utils/consts/logTypes";
import { TMP_VOICE_DASHBOARD_TOPIC_MARKER, TMP_VOICE_TOPIC_MARKER } from "utils/consts/tmpVoiceTypes";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { logger } from "utils/logger/logger";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { autoRoleManager } from "utils/discord/autoRoleManager";

export const data = {
  event: Events.ChannelDelete,
};

export const main = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  if (!channel || channel.isDMBased() || !channel.guild) return;

  try {
    const ch = channel as any;
    if (ch.type === 2 && tmpVoiceManager.isTracked(ch.id)) {
      const guild = ch.guild;
      tmpVoiceManager.removeTracked(ch.id);
      tmpVoiceManager.removeOwner(ch.id);
      tmpVoiceManager.removeTextChannel(ch.id);

      const channels = getTextChannelsWithTopic(guild);
      const dashboard = findChannelByTopic(channels, DASHBOARD_TOPIC);
      if (dashboard) {
        const state = computeLogState(getTextChannelsWithTopic(guild), guild.id);
        const lang = guild.preferredLocale.split("-")[0];
        const container = logPanelContainer({ interaction: lang, ...state });
        const messages = await dashboard.messages.fetch({ limit: 10 });
        const botMessage = messages.find(m => m.author.id === guild.members.me?.id);
        if (botMessage) {
          await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
        } else {
          await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
      }

      return;
    }

    if (!("topic" in channel)) return;

    const topic = channel.topic ?? "";
    if (!topic) return;

    const guild = channel.guild;

    const isManagedChannel = ALL_LOG_MARKERS.some(c => topic.includes(c));
    if (!isManagedChannel) return;

    const channels = getTextChannelsWithTopic(guild);

    if (topic.includes(TMP_VOICE_DASHBOARD_TOPIC_MARKER) || topic.includes(TMP_VOICE_TOPIC_MARKER)) return;

    if (topic.includes(DASHBOARD_TOPIC)) {
      autoRoleManager.clearGuild(guild.id);

      const managed = channels.filter(ch =>
        ALL_LOG_MARKERS.some(c => hasTopic(ch, c))
      );

      await Promise.allSettled(managed.map(ch => {
        ch.delete().catch(() => null);
        ch.parent?.delete().catch(() => null);
      }));
      
      return;
    }

    const dashboard = findChannelByTopic(channels, DASHBOARD_TOPIC);
    if (!dashboard) return;

    const state = computeLogState(getTextChannelsWithTopic(guild), guild.id);

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
    }).catch(() => null);
  } catch (error) {
    logger.error("Error in log system channel delete listener", error as Record<string, unknown>);
  }
};