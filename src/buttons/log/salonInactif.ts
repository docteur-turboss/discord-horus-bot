import {
  ButtonInteraction,
  TextChannel,
  MessageFlags,
} from "discord.js";
import { IC_ZeroWidthJoiner, IC_ZeroWidthNonJoiner, IC_ZeroWidthSpace } from "utils/consts/invisiblesChars";
import { logPanelContainer } from "utils/discord/logPanelContainer";

export const data = {
  name : "embeds.logs.channels.inactif"
}

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.guild || !interaction.channel) return;

  const guild = interaction.guild;

  const logChannel = guild.channels.cache.find((ch) => {
    if (!ch.isTextBased()) return false;
    if (!("topic" in ch)) return false;

    return (ch as TextChannel).topic?.includes(IC_ZeroWidthJoiner);
  }) as TextChannel | undefined;
  if (!logChannel) return;

  const message = interaction.message;

  if (!message || !message.components.length) return;

  const channels = guild.channels.cache.filter(ch => {
    if (!ch.isTextBased()) return false;
    if (!("topic" in ch)) return false;
    return true;
  })

  const messageLogChannel = channels.find(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthJoiner))?.delete("");
  if(!messageLogChannel) return;

  const hasMessageLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthSpace));
  const hasRoleLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthNonJoiner));
  const hasChannelLog = false;
  
  const lang = guild.preferredLocale.split("-")[0];
  const container = logPanelContainer({
    hasRoleLog,
    interaction: lang,
    hasChannelLog,
    hasMessageLog,
  });

  await interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  return logChannel;
};