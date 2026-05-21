import { Events, Webhook } from "discord.js";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { logger } from "utils/logger/logger";
import { TMP_VOICE_WEBHOOK_NAME } from "utils/consts/tmpVoiceTypes";

export const data = {
  event: Events.WebhooksUpdate,
};

export const main = async (channel: any) => {
  if (!channel.guild) return;
  if (!channel.guild.channels.cache.has(channel.id)) return;
  if (!tmpVoiceManager.isTracked(channel.id)) return;

  try {
    const webhooks = await channel.fetchWebhooks();
    const botWebhook = webhooks.find(
      (w: Webhook) => w.name === TMP_VOICE_WEBHOOK_NAME && w.owner?.id === channel.client.user?.id
    );

    if (!botWebhook) {
      const newWebhook = await tmpVoiceManager.ensureWebhook(channel);
      if (newWebhook) {
        tmpVoiceManager.addTracked({
          trackedChannelId: channel.id,
          guildId: channel.guild.id,
          webhookId: newWebhook.id,
        });
        logger.info(`Recreated missing webhook for tracked voice channel ${channel.id}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to protect webhook for channel ${channel.id}`, error as Record<string, unknown>);
  }
};
