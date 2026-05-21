import { ChannelType, Guild, PermissionFlagsBits, TextChannel } from "discord.js";
import { DASHBOARD_TOPIC } from "utils/consts/logTypes";
import { t } from "utils/locales/i18n";

export const createLogDashboard = async (guild: Guild, lang: string): Promise<TextChannel> => {
  const category = await guild.channels.create({
    name: t(lang, "channel.log_system"),
    type: ChannelType.GuildCategory,
  });

  const channel = await guild.channels.create({
    name: "dashboard",
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `Logs ${DASHBOARD_TOPIC} channel. Do not delete or modify this channel, otherwise the logging system will stop working.`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
    ],
  });

  return channel as TextChannel;
};