import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { formatRolePermissions } from "utils/helper/formatPermissions";
import { getLogRoleChannel } from "utils/discord/getLogRoleChannel";
import { AuditLogEvent, Events, Role } from "discord.js";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = {
  event: Events.GuildRoleCreate,
};

export const main = async (role: Role) => {
  if (!role) return;
  if (!role.guild) return;

  try {
    const guild = role.guild;
    
    const member = await getExecutorFromAuditLog(guild, AuditLogEvent.RoleCreate)
    if(!member) return;

    const logChannel = getLogRoleChannel(guild);
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
        value: `${formatRolePermissions(role, lang)}`,
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
      description: t(lang, "embeds.logs.roles.create.description"),
      type: "roles",
      fields,
      lang,
    });

    await logChannel.send({
      embeds: [embed],
    });

  } catch (error) {
    logger.error("Error in role create events listener", error as Record<string, unknown>);
  }
};