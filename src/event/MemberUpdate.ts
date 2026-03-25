import { getLogModerationChannel } from "utils/discord/getLogModerationChannel";
import { getExecutorFromAuditLog } from "utils/helper/getExecutorFromAuditLog";
import { AuditLogEvent, Events, GuildMember } from "discord.js";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = {
  event: Events.GuildMemberUpdate,
};

export const main = async (
  oldMember: GuildMember,
  newMember: GuildMember
) => {
  if (!oldMember || !newMember?.guild) return;

  try {
    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;

    if (oldTimeout === newTimeout) return;

    const guild = newMember.guild;
    const logChannel = getLogModerationChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    await new Promise((res) => setTimeout(res, 500));

    const executor = await getExecutorFromAuditLog(
      guild,
      AuditLogEvent.MemberUpdate
    );

    let description = "";
    const fields = [
      {
        name: t(lang, "embeds.logs.fields.user"),
        value: `<@${newMember.id}> (\`${newMember.displayName}\`)`,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.user.responsable"),
        value: executor ? `<@${executor.id}>` : "*unknown*",
        inline: true,
      },
    ];

    if (!oldTimeout && newTimeout) {
      description = t(lang, "moderation.mute_description");

      const durationMs = newTimeout - Date.now();
      const durationSec = Math.max(0, Math.floor(durationMs / 1000));

      fields.push(
        {
          name: t(lang, "embeds.logs.fields.duration"),
          value: `\`${durationSec}s\` (<t:${Math.floor(newTimeout / 1000)}:F>)`,
          inline: true,
        },
      );
    }

    if (oldTimeout && !newTimeout) {
      description = t(lang, "moderation.unmute_description");
    }
    if (!description) return;


    const embed = logEmbed({
      type: "moderation",
      lang,
      description,
      fields,
    });

    await logChannel.send({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(
      "Error in guild member update (mute/unmute) listener",
      error as Record<string, unknown>
    );
  }
};