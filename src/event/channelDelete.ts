import { 
  NonThreadGuildBasedChannel,
  AuditLogEvent,
  DMChannel,
  Events,
} from "discord.js";
import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { formatChannelPermissions } from "utils/helper/formatPermissions";
import { CHANNEL_TYPE_MAP } from "utils/consts/channelTypeMap";
import { getLogChannel } from "utils/discord/getLogChannel";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { buildChannelSpecificFields } from "utils/embeds/buildChannelSpecificFields";

export const data = {
  event: Events.ChannelDelete,
};

export const main = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  if (!channel || channel.isDMBased() || !channel.guild) return;

  try {
    if(channel.partial) await channel.fetch().catch(() => null);
    const guild = channel.guild;

    const member = await getExecutorFromAuditLog(guild, AuditLogEvent.ChannelDelete)
    if(!member) return;

    const logChannel = getLogChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const permissions = formatChannelPermissions(channel, lang);

    const fields = [
      {
        name: t(lang, "embeds.logs.fields.name"),
        value: `\`${channel.name}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.type"),
        value: t(lang, CHANNEL_TYPE_MAP[channel.type] ?? "channel.type.unknown"),
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.parent"),
        value: channel.parentId ? `<#${channel.parentId}>` : "*none*",
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.position"),
        value: `\`${channel.position}\``,
        inline: true,
      },
      ...buildChannelSpecificFields(channel, lang), {
        name: t(lang, "embeds.logs.fields.permissions"),
        value: permissions,
        inline: false,
      }, {
        name: t(lang, "embeds.logs.fields.user.responsable"),
        value: `<@${member.id}>`,
        inline: false,
      }, 
    ];

    const embed = logEmbed({
      type: "channels",
      lang,
      description: t(lang, "embeds.logs.channels.delete.description"),
      fields,
    });

    await logChannel.send({
      embeds: [embed],
    });

  } catch (error) {
    logger.error("Error in channel delete events listener", error as Record<string, unknown>);
  }
};