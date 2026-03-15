import { validateModerationPermissions } from "utils/moderations/validateModerationPermissions";
import { validateModerationTarget } from "utils/moderations/validateModerationTarget";
import { validateRoleHierarchy } from "utils/moderations/validateRoleHierarchy";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ensureGuildInteraction } from "utils/discord/ensureGuildInteraction";
import { reply, followUp, targetSend } from "utils/discord/reply";
import { getMemberSafe } from "utils/discord/getMemberSafe";
import { confirmAction } from "utils/discord/confirmAction";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = new SlashCommandBuilder()
.setName("mute")
.setNameLocalizations({
  fr: "mute",
})
.setDescription("Mute (timeout) a member from the server.")
.setDescriptionLocalizations({
  fr: "Réduire au silence un membre du serveur.",
})
.addUserOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to mute")
  .setDescriptionLocalizations({
    fr: "Utilisateur à réduire au silence",
  })
  .setRequired(true)
)
.addIntegerOption((option) =>
  option
  .setName("duration")
  .setNameLocalizations({
    fr: "duree",
  })
  .setDescription("Duration in minutes")
  .setDescriptionLocalizations({
    fr: "Durée en minutes",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
  .setName("reason")
  .setNameLocalizations({
    fr: "raison",
  })
  .setDescription("Reason for the mute")
  .setDescriptionLocalizations({
    fr: "Raison du mute",
  })
  .setRequired(false)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!(await ensureGuildInteraction(interaction))) return;
    if (!(await validateModerationPermissions(interaction, "mute"))) return;

    const targetUser = interaction.options.getUser("user", true);
    const duration = interaction.options.getInteger("duration", true);

    const reason =
      interaction.options.getString("reason") ||
      t(interaction, "moderation.no_reason");

    if (!(await validateModerationTarget(interaction, targetUser.id))) return;

    const targetMember = await getMemberSafe(interaction.guild!, targetUser.id);

    if (!targetMember)
      return await reply(interaction, {
        key: "errors.user_not_found",
        ephemeral: true,
        type: "error",
      });

    if (!(await validateRoleHierarchy(interaction, targetMember))) return;

    if (!targetMember.moderatable)
      return await reply(interaction, {
        key: "errors.not_moderatable",
        ephemeral: true,
        type: "error",
      });

    const timeoutMs = duration * 60 * 1000;

    const vars = {
      guild: interaction.guild!.name,
      reason,
      user: targetUser.tag,
      moderator: interaction.user.tag,
      duration: duration.toString(),
    };

    await confirmAction(interaction, {
      confirmKey: "moderation.mute_confirm",
      successKey: "moderation.mute_success",
      vars,

      onConfirm: async () => {
        await targetSend(targetMember, interaction, {
          key: "moderation.mute_dm",
          vars,
          type: "info",
        }).catch(() => null);

        await targetMember.timeout(timeoutMs, reason);
      },
    });

    /*
    ========================================
    FUTURE MODERATION LOG SYSTEM
    ========================================

    const logChannelId = "LOG_CHANNEL_ID";

    const logChannel = interaction.guild?.channels.cache.get(logChannelId);

    if (logChannel && logChannel.isTextBased()) {

      const logEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🔇 Member Muted")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: `${duration} minutes`, inline: true },
          { name: "Reason", value: reason || "No reason provided", inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
    */

  } catch (err) {
    logger.error("Error executing mute command:", err as Record<string, unknown>);

    if (!interaction.replied)
      return await reply(interaction, {
        key: "errors.command_execution",
        ephemeral: true,
        type: "error",
      });

    return await followUp(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
      type: "error",
    });
  }
};