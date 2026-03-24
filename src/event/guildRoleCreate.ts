import { IC_ZeroWidthNonJoiner } from "utils/consts/invisiblesChars";
import { AuditLogEvent, Events, Role, TextChannel } from "discord.js";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { formatPerm } from "utils/helper/formatPerm";

export const data = {
  event: Events.GuildRoleCreate,
};

export const main = async (role: Role) => {
  if (!role) return;
  if (!role.guild) return;

  try {
    const guild = role.guild;

    const log = await guild.fetchAuditLogs({ 
      type: AuditLogEvent.RoleCreate
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

    const lang = guild.preferredLocale.split("-")[0];

    const fields = [
      {
        name: t(lang, "embeds.logs.fields.name"),
        value: `\`${role.name}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.color"),
        value: `\`${role.hexColor}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.position"),
        value: `\`${role.position}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.permissions"),
        value: `${role.permissions.toArray().map(v => formatPerm(v, lang)).slice(0, 10).join(",\n") || "*none*"}`,
        inline: false,
      },{
        name: t(lang, "embeds.logs.fields.user.responsable"),
        value: `<@${member.id}>`,
      }
    ];

    if (role.icon) {
      fields.push({
        name: t(lang, "embeds.logs.fields.icon"),
        value: role.iconURL() ?? "*none*",
        inline: false,
      });
    }

    const embed = logEmbed({
      type: "roles",
      lang,
      description: t(lang, "embeds.logs.roles.create.description"),
      fields,
    });

    await logChannel.send({
      embeds: [embed],
    });

  } catch (error) {
    logger.error("Error in role create events listener", error as Record<string, unknown>);
  }
};