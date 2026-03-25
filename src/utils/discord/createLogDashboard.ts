import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { DASHBOARD_TOPIC } from "utils/consts/logTypes";
import { t } from "utils/locales/i18n";

export const createLogDashboard = async (interaction: ChatInputCommandInteraction) => {
  const guild = interaction.guild!;

  const category = await guild.channels.create({
    name: t(interaction, "channel.log_system"),
    type: ChannelType.GuildCategory,
  });

  return guild.channels.create({
    name: "dashboard",
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `Logs ${DASHBOARD_TOPIC}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
    ],
  });
};