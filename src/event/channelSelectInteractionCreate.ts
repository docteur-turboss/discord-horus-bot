import { ChannelSelectMenuInteraction, Events, MessageFlags, VoiceChannel } from "discord.js";
import { logger } from "utils/logger/logger";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannelByGuild, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { createLogDashboard } from "utils/discord/createLogDashboard";
import { t } from "utils/locales/i18n";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { successEmbed } from "utils/embeds/successEmbed";

export const data = {
  event: Events.InteractionCreate,
};

export const main = async (interaction: ChannelSelectMenuInteraction) => {
  if (!interaction.isChannelSelectMenu() || interaction.customId !== "tmp_voice_channel_select") return;
  if (!interaction.guild || !interaction.channel) return;

  const lang = interaction.locale.split("-")[0];
  const voiceChannel = interaction.guild.channels.cache.get(interaction.values[0]) as VoiceChannel | undefined;
  if (!voiceChannel || voiceChannel.type !== 2) {
    await interaction.reply({
      embeds: [errorEmbed({ description: t(lang, "errors.channel_not_found"), lang })],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferUpdate();

  try {
    const webhook = await tmpVoiceManager.ensureWebhook(voiceChannel);
    if (!webhook) {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(lang, "errors.command_execution"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    tmpVoiceManager.addTracked({
      trackedChannelId: voiceChannel.id,
      guildId: interaction.guild.id,
      webhookId: webhook.id,
    });

    const existingDashboard = findDashboardChannelByGuild(interaction.guild);

    if (existingDashboard) {
      const state = computeLogState(getTextChannelsWithTopic(interaction.guild), interaction.guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });
      const messages = await existingDashboard.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m =>
        m.author.id === interaction.client.user?.id &&
        m.components.length > 0
      );
      if (botMessage) {
        await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
      } else {
        await existingDashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } else {
      const dashboard = await createLogDashboard(interaction.guild, lang);
      const channels = getTextChannelsWithTopic(interaction.guild);
      const state = computeLogState(channels, interaction.guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });
      await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    await interaction.followUp({
      embeds: [successEmbed({ description: t(lang, "tmp_voice.created", { channel: `<#${voiceChannel.id}>` }), lang })],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    logger.error("Error setting up tmp voice tracking", error as Record<string, unknown>);
    await interaction.reply({
      embeds: [errorEmbed({ description: t(lang, "errors.command_execution"), lang })],
      flags: MessageFlags.Ephemeral,
    });
  }
};
