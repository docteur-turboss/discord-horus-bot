import { Client, Events, MessageFlags } from "discord.js";
import { logger } from "utils/logger/logger";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, getTextChannelsWithTopic, findDashboardChannelByGuild } from "utils/helper/getLogChannelWithTopic";
import { createLogDashboard } from "utils/discord/createLogDashboard";

export const data = {
  event: Events.ClientReady,
  once: true,
}

const updateDashboardsOnStartup = async (client: Client) => {
  for (const guild of client.guilds.cache.values()) {
    try {
      const lang = guild.preferredLocale.split("-")[0];
      const channels = getTextChannelsWithTopic(guild);
      const state = computeLogState(channels, guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });

      const dashboard = findDashboardChannelByGuild(guild);
      if (dashboard) {
        const messages = await dashboard.messages.fetch({ limit: 10 });
        const botMessage = messages.find(m =>
          m.author.id === client.user?.id &&
          m.components.length > 0
        );
        if (botMessage) {
          await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
        } else {
          await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
      } else {
        const newDashboard = await createLogDashboard(guild, lang);
        await newDashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch (error) {
      logger.error(`Failed to update dashboard in guild ${guild.id}`, error as Record<string, unknown>);
    }
  }
};

export const main = async (client: Client ) => {
  logger.info(`Bot ready! Logged in as ${client.user?.tag}`);

  await tmpVoiceManager.scanGuildWebhooks(client);
  await tmpVoiceManager.recoverVoiceChannels(client);
  await updateDashboardsOnStartup(client);
}
