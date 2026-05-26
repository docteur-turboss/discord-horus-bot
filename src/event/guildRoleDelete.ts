import { t } from "../utils/locales/i18n";
import { logger } from "utils/logger/logger";
import { logEmbed } from "utils/embeds/logEmbed";
import { AuditLogEvent, Events, Role } from "discord.js";
import { getLogRoleChannel } from "utils/discord/getLogRoleChannel";
import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { findRulesConfigsInGuild, cleanupRulesConfig } from "utils/discord/validateRulesConfig";
import { autoRoleManager } from "utils/discord/autoRoleManager";

export const data = {
  event: Events.GuildRoleDelete,
};

const cleanupDeletedRoleInRules = async (roleId: string, guild: import("discord.js").Guild) => {
  const configs = findRulesConfigsInGuild(guild);
  const matching = configs.filter((c) => c.roleId === roleId);
  for (const config of matching) {
    await cleanupRulesConfig(config, guild);
  }
};

export const main = async (
  role: Role,
) => {
  if (!role) return;
  if (!role.guild) return;

  try {
    const guild = role.guild;
    if(!guild) return;

    await cleanupDeletedRoleInRules(role.id, guild);

    if (autoRoleManager.getAutoRole(guild.id) === role.id) {
      await autoRoleManager.removeAutoRole(guild);
    }

    const member = await getExecutorFromAuditLog(guild, AuditLogEvent.RoleDelete)
    if(!member) return;

    const logChannel = getLogRoleChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0]

    const embeds = logEmbed({
      type: "roles",
      lang,
      description: t(lang, "embeds.logs.roles.delete.description"),
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
    logger.error("Error in role delete events listener", error as Record<string, unknown>);
  }
};