import { AuditLogEvent, Events, GuildBan } from "discord.js";
import { getMessageLogChannel } from "utils/discord/getMessageLogChannel";
import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = {
  event: Events.GuildBanRemove,
};

export const main = async (ban: GuildBan) => {
  if (!ban?.guild) return;

  try {
    const guild = ban.guild;
    const logChannel = getMessageLogChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const executor = await getExecutorFromAuditLog(
      guild,
      AuditLogEvent.MemberBanRemove
    );

		if(!executor || executor.bot) return;

    const embeds = logEmbed({
      type: "moderation",
      lang,
      description: t(lang, "moderation.unban_description"),
      fields: [
        {
          name: t(lang, "embeds.logs.fields.user"),
          value: `<@${ban.user.id}>`,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.user"),
          value: `${executor.displayName} (\`${ban.user.id}\`)`,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.user.responsable"),
          value: executor ? `<@${executor.id}>` : "*unknown*",
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.reason"),
          value: ban.reason ?? t(lang, "moderation.no_reason"),
          inline: false,
        },
      ],
    });

    await logChannel.send({
      embeds: [embeds],
    });

  } catch (error) {
    logger.error(
      "Error in guild ban add events listener",
      error as Record<string, unknown>
    );
  }
};