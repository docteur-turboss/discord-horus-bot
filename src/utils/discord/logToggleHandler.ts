import { computeLogState, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { createLogChannel, deleteLogChannel } from "./createAndDeleteChannel";
import { ButtonInteraction, TextChannel } from "discord.js";
import { updatePanel } from "utils/embeds/updateLogPanel";
import { LogType } from "utils/consts/logTypes";

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

  const state = computeLogState(getTextChannelsWithTopic(guild));
  await updatePanel(interaction, state);

  return logChannel;
};