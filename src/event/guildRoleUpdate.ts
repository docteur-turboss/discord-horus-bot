import { AuditLogEvent, Events, Role, TextChannel } from "discord.js";
import { IC_ZeroWidthNonJoiner } from "utils/consts/invisiblesChars";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { formatPerm } from "utils/helper/formatPerm";

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

    const log = await guild.fetchAuditLogs({ 
      type: AuditLogEvent.RoleUpdate
    })
    if(!log) return;

    const firstLogEntries = log.entries.first();
    if(!firstLogEntries) return;

    const member = firstLogEntries.executor;
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

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      const oldPerms = new Set(oldRole.permissions.toArray());
      const newPerms = new Set(newRole.permissions.toArray());

      const added = [...newPerms].filter(p => !oldPerms.has(p));
      const removed = [...oldPerms].filter(p => !newPerms.has(p));

      let value = "";

      if (added.length > 0) {
        let addedMapped = added.map(v => formatPerm(v, lang));
        const addLeng = addedMapped.length;

        addedMapped = addLeng>10? addedMapped.slice(0, 10): addedMapped;
        value += `+ \n\`${addedMapped.join("`,\n`")}\`` + (addLeng>10? "\n...": "");
      }

      if (removed.length > 0) {
        if(value !== "") value += "\n=====================\n"
        
        let removeMapped = removed.map(v => formatPerm(v, lang));
        const remLeng = removeMapped.length;

        removeMapped = remLeng>10? removeMapped.slice(0, 10): removeMapped;

        value += `\-\n\`${removeMapped.join("`,\n`")}\`` + (remLeng>10? "\n...": "");
      }

      fields.push({
        name: t(lang, "embeds.logs.fields.permissions.update"),
        value: value || "*updated*",
        inline: false,
      });
    }

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