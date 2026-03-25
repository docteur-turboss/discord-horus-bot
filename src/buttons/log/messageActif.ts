import {
  ButtonInteraction,
  ChannelType,
  TextChannel,
  MessageFlags,
} from "discord.js";
import { IC_ZeroWidthJoiner, IC_ZeroWidthNonJoiner, IC_ZeroWidthSpace } from "utils/consts/invisiblesChars";
import { logPanelContainer } from "utils/discord/logPanelContainer";
import { t } from "utils/locales/i18n";

export const data = {
  name : "embeds.logs.message.actif"
}

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.guild || !interaction.channel) return;

  const guild = interaction.guild;
  const currentChannel = interaction.channel as TextChannel;

  const categoryId = currentChannel.parentId;

  const logChannel = await guild.channels.create({
    name: t(interaction, "embeds.logs.message"),
    type: ChannelType.GuildText,
    parent: categoryId ?? undefined,
    topic: `Message ${IC_ZeroWidthSpace} logs`,
  });

  const message = interaction.message;

  if (!message || !message.components.length) return;

  const channels = guild.channels.cache.filter(ch => {
    if (!ch.isTextBased()) return false;
    if (!("topic" in ch)) return false;
    return true;
  });
  
  const hasMessageLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthSpace));
  const hasRoleLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthNonJoiner));
  const hasChannelLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthJoiner));
  
  const container = logPanelContainer({
    hasRoleLog,
    interaction,
    hasChannelLog,
    hasMessageLog,
  });

  await interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  return logChannel;
};