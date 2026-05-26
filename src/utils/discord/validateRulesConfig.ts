import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { RULES_ACCEPT_TOPIC_MARKER } from "utils/consts/rulesTypes";
import { logger } from "utils/logger/logger";

const RULES_ACCEPT_TOPIC_PATTERN = /^rules:accept:(\d+):(\d+)/m;

type RulesConfig = {
  channel: TextChannel;
  roleId: string;
  messageId: string;
};

export function findRulesConfigsInGuild(guild: Guild): RulesConfig[] {
  const channels = getTextChannelsWithTopic(guild);
  const results: RulesConfig[] = [];

  for (const channel of channels.values()) {
    const topic = channel.topic;
    if (!topic || !topic.includes(RULES_ACCEPT_TOPIC_MARKER)) continue;

    const match = topic.match(RULES_ACCEPT_TOPIC_PATTERN);
    if (!match) continue;

    results.push({ channel, roleId: match[1], messageId: match[2] });
  }

  return results;
}

export function removeRulesLineFromTopic(topic: string, roleId: string): string {
  const linePattern = new RegExp(`^rules:accept:${roleId}:\\d+ .*$`, "m");
  return topic.replace(linePattern, "").replace(/\n{2,}/g, "\n").replace(/^\n|\n$/g, "").trim();
}

export async function cleanupRulesConfig(config: RulesConfig, guild: Guild): Promise<void> {
  try {
    const channel = config.channel;

    const rulesMessage = await channel.messages.fetch(config.messageId).catch(() => null);
    if (!rulesMessage) {
      logger.warn(
        `Rules message ${config.messageId} not found in channel ${channel.id} (guild ${guild.id})`,
      );
    } else {
      const embed = rulesMessage.embeds[0];
      if (embed) {
        const newEmbed = EmbedBuilder.from(embed);
        await rulesMessage.edit({ embeds: [newEmbed], components: [] });
      }
    }

    const updatedTopic = removeRulesLineFromTopic(channel.topic ?? "", config.roleId);
    await channel.setTopic(updatedTopic || null);

    logger.info(
      `Cleaned up rules config in channel ${channel.id} (guild ${guild.id}) — role ${config.roleId} no longer exists`,
    );
  } catch (error) {
    logger.error(
      `Failed to clean up rules config in channel ${config.channel.id}`,
      error as Record<string, unknown>,
    );
  }
}

export async function validateRulesInGuild(guild: Guild): Promise<void> {
  const configs = findRulesConfigsInGuild(guild);

  for (const config of configs) {
    const role = guild.roles.cache.get(config.roleId);
    if (!role) {
      await cleanupRulesConfig(config, guild);
    }
  }
}
