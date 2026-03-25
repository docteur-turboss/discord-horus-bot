
import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { diffRolePermissions } from "utils/helper/formatPermissions";
import { getLogRoleChannel } from "utils/discord/getLogRoleChannel";
import { AuditLogEvent, Events, Role } from "discord.js";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = {
  event: Events.GuildRoleUpdate,
};

export const main = async (
  oldRole: Role,
  newRole: Role,
) => {
  if (!oldRole || !newRole) return;
  if (!newRole.guild) return;

  try {
    const guild = newRole.guild;

    const member = await getExecutorFromAuditLog(guild, AuditLogEvent.RoleUpdate)
    if(!member) return;

    const logChannel = getLogRoleChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const fields = [];

    if (oldRole.name !== newRole.name) {
      fields.push({
        name: t(lang, "embeds.logs.fields.name.update"),
        value: `\`${oldRole.name}\` → \`${newRole.name}\``,
        inline: false,
      });
    }

    if (oldRole.hexColor !== newRole.hexColor) {
      fields.push({
        name: t(lang, "embeds.logs.fields.color.update"),
        value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
        inline: true,
      });
    }

    if (oldRole.position !== newRole.position) {
      fields.push({
        name: t(lang, "embeds.logs.fields.position.update"),
        value: `\`${oldRole.position}\` → \`${newRole.position}\``,
        inline: true,
      });
    }

    if (oldRole.icon !== newRole.icon) {
      fields.push({
        name: t(lang, "embeds.logs.fields.icon.update"),
        value: newRole.iconURL() ?? "*none*",
        inline: false,
      });
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) fields.push({
      name: t(lang, "embeds.logs.fields.permissions.update"),
      value: diffRolePermissions(oldRole, newRole, lang) ?? "",
      inline: false,
    });

    if (fields.length === 0) return;

    fields.push({
      name: t(lang, "embeds.logs.fields.user.responsable"),
      value: `<@${member.id}>`,
    });

    newRole.permissions
    const embeds = logEmbed({
      type: "roles",
      lang,
      description: t(lang, "embeds.logs.roles.update.description"),
      fields
    });

    logChannel.send({
      embeds: [embeds]
    });
  } catch (error) {
    logger.error("Error in role update events listener", error as Record<string, unknown>);
  }
};