import { ChannelType, ChatInputCommandInteraction, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { t } from "utils/locales/i18n";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannelByGuild, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { createLogDashboard } from "utils/discord/createLogDashboard";

export const data = new SlashCommandBuilder()
  .setName("create-tmp-voice-channel")
  .setDescription("Configure a temporary voice channel entry point")
  .setDescriptionLocalizations({
    fr: "Configure un salon vocal temporaire",
  })
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setNameLocalizations({
        fr: "salon",
      })
      .setDescription("Voice channel to track (optional)")
      .setDescriptionLocalizations({
        fr: "Salon vocal à tracker (optionnel)",
      })
      .addChannelTypes(ChannelType.GuildVoice)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    const guild = interaction.guild;
    if (!guild) return;

    const existing = tmpVoiceManager.getTrackedChannels(guild.id);
    if (existing.length > 0) {
      return reply(interaction, {
        key: "errors.tmp_voice_already_configured",
        ephemeral: true,
        type: "error",
      });
    }

    let targetChannel = interaction.options.getChannel("channel");

    if (!targetChannel) {
      const anyVoiceCategory = guild.channels.cache.find(
        (ch) => ch.type === ChannelType.GuildVoice
      )?.parent;

      if (anyVoiceCategory) {
        targetChannel = await guild.channels.create({
          name: t(interaction, "channel.tmp_voice_base_name"),
          type: ChannelType.GuildVoice,
          parent: anyVoiceCategory.id,
        });
      } else {
        const category = await guild.channels.create({
          name: t(interaction, "channel.tmp_voice_category"),
          type: ChannelType.GuildCategory,
        });

        targetChannel = await guild.channels.create({
          name: t(interaction, "channel.tmp_voice_base_name"),
          type: ChannelType.GuildVoice,
          parent: category.id,
        });
      }
    }

    const voiceTarget = guild.channels.cache.get(targetChannel.id) as VoiceChannel | undefined;
    if (!voiceTarget || voiceTarget.type !== ChannelType.GuildVoice) {
      return reply(interaction, {
        key: "errors.channel_not_found",
        ephemeral: true,
        type: "error",
      });
    }

    const webhook = await tmpVoiceManager.ensureWebhook(voiceTarget);
    if (!webhook) {
      return reply(interaction, {
        key: "errors.command_execution",
        ephemeral: true,
        type: "error",
      });
    }

    tmpVoiceManager.addTracked({
      trackedChannelId: targetChannel.id,
      guildId: guild.id,
      webhookId: webhook.id,
    });

    const lang = interaction.locale.split("-")[0];
    const existingDashboard = findDashboardChannelByGuild(guild);

    if (existingDashboard) {
      const channels = getTextChannelsWithTopic(guild);
      const state = computeLogState(channels, guild.id);
      const messages = await existingDashboard.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m =>
        m.author.id === interaction.client.user?.id &&
        m.components.length > 0
      );
      const container = logPanelContainer({ interaction: lang, ...state });
      if (botMessage) {
        await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
      } else {
        await existingDashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } else {
      const dashboard = await createLogDashboard(guild, lang);
      const channels = getTextChannelsWithTopic(guild);
      const state = computeLogState(channels, guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });
      await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    await reply(interaction, {
      key: "tmp_voice.created",
      ephemeral: true,
      type: "success",
      vars: { channel: `<#${targetChannel.id}>` },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "create-tmp-voice-channel");
  }
};
