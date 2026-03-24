import { t } from "../utils/locales/i18n";
import { logger } from "utils/logger/logger";
import { logEmbed } from "utils/embeds/logEmbed";
import { IC_ZeroWidthNonJoiner } from "utils/consts/invisiblesChars";
import { AuditLogEvent, Events, Role, TextChannel } from "discord.js";

export const data = {
  event: Events.GuildRoleDelete,
};

export const main = async (
  role: Role,
) => {
  if (!role) return;
  if (!role.guild) return;

  try {
    const guild = role.guild;
    if(!guild) return;

    const log = await role.guild.fetchAuditLogs({ 
      type: AuditLogEvent.RoleDelete
    })
    if(!log) return;

    const firstLogEntries = log.entries.first();
    if(!firstLogEntries) return;

    const member = firstLogEntries.executor
    if(member?.partial) await member.fetch().catch(() => null);
    
    if(!member) return;
    if(member.bot) return;

    const logChannel = guild.channels.cache.find((channel) => {
      if (!channel.isTextBased()) return false;
      if (!("topic" in channel)) return false;

      const textChannel = channel as TextChannel;
      return textChannel.topic?.includes(IC_ZeroWidthNonJoiner);
    }) as TextChannel | undefined;
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0]

    const embeds = logEmbed({
      type: "roles",
      lang,
      description: t(lang, "embeds.logs.role.delete.description"),
      fields: [
        {
          name: t(lang, "embeds.logs.fields.role"),
          value: `\`${role.name}\``,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.user.responsable"),
          value: `<@${member.id}>`,
        },
      ],
    });

    logChannel.send({
      embeds: [embeds]
    })
  } catch (error) {
    logger.error("Error in role events listener", error as Record<string, unknown>);
  }
};