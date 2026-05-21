import { computeLogState, getTextChannelsWithTopic, findChannelByTopic } from "utils/helper/getLogChannelWithTopic";
import { tmpVoiceManager } from "./tmpVoiceManager";
import { createLogChannel, deleteLogChannel, deleteTmpVoiceTextChannel } from "./createAndDeleteChannel";
import { ButtonInteraction, ChannelSelectMenuBuilder, ChannelType, TextChannel, VoiceChannel, ActionRowBuilder } from "discord.js";
import { t } from "utils/locales/i18n";
import { updatePanel } from "utils/embeds/updateLogPanel";
import { LogType } from "utils/consts/logTypes";
import { TMP_VOICE_DASHBOARD_TOPIC_MARKER } from "utils/consts/tmpVoiceTypes";
import { reply } from "./reply";

export const handleLogToggle = async (
  interaction: ButtonInteraction,
  type: LogType,
  active: boolean
) => {
  if (!interaction.guild || !interaction.channel) return;

  const guild = interaction.guild;
  const message = interaction.message;

  if (!message || !message.components.length) return;

  const channels = getTextChannelsWithTopic(guild);

  let logChannel: TextChannel | null = null;

  if (active) {
    logChannel = await createLogChannel(interaction, type);
  } else {
    logChannel = await deleteLogChannel(channels, type);
    if (!logChannel) return;
  }

  const state = computeLogState(getTextChannelsWithTopic(guild), guild.id);
  await updatePanel(interaction, state);

  return logChannel;
};

export const handleTmpVoiceToggle = async (
  interaction: ButtonInteraction,
  active: boolean
) => {
  if (!interaction.guild || !interaction.channel) return;

  const guild = interaction.guild;

  if (active) {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("tmp_voice_channel_select")
      .setPlaceholder(t(interaction, "tmp_voice.configuration"))
      .setChannelTypes(ChannelType.GuildVoice);

    await reply(interaction, {
      key: "tmp_voice.created",
      ephemeral: true,
      type: "info",
      components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu)],
    });

    return;
  }

  const channels = getTextChannelsWithTopic(guild);
  const deleted = await deleteTmpVoiceTextChannel(channels);

    if (!deleted) {
    for (const trackedId of tmpVoiceManager.getTrackedChannels(guild.id)) {
      const voiceChannel = guild.channels.cache.get(trackedId) as VoiceChannel | undefined;
      if (voiceChannel) {
        await voiceChannel.delete().catch(() => null);
      }
      tmpVoiceManager.removeTracked(trackedId);
    }
  }

  const state = computeLogState(getTextChannelsWithTopic(guild), guild.id);
  await updatePanel(interaction, state);
};
