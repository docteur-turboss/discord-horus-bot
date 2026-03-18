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
.setName("unmute")
.setNameLocalizations({
  fr: "demute",
})
.setDescription("Remove timeout from a member.")
.setDescriptionLocalizations({
  fr: "Retirer le mute d'un membre.",
})
.addUserOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to unmute")
  .setDescriptionLocalizations({
    fr: "Utilisateur à démute",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
  .setName("reason")
  .setNameLocalizations({
    fr: "raison",
  })
  .setDescription("Reason for the unmute")
  .setDescriptionLocalizations({
    fr: "Raison du démute",
  })
  .setRequired(false)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!(await ensureGuildInteraction(interaction))) return;
    if (!(await validateModerationPermissions(interaction, "ModerateMembers"))) return;

    const targetUser = interaction.options.getUser("user", true);

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

    if (!targetMember.communicationDisabledUntil)
      return await reply(interaction, {
        key: "errors.user_not_muted",
        ephemeral: true,
        type: "error",
      });

    const vars = {
      guild: interaction.guild!.name,
      reason,
      user: targetUser.tag,
      moderator: interaction.user.tag,
    };

    await confirmAction(interaction, {
      confirmKey: "moderation.unmute_confirm",
      successKey: "moderation.unmute_success",
      vars,

      onConfirm: async () => {
        await targetSend(targetMember, interaction, {
          key: "moderation.unmute_dm",
          vars,
          type: "info",
        }).catch(() => null);

        await targetMember.timeout(null, reason);
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
        .setColor(0x57F287)
        .setTitle("🔊 Member Unmuted")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason || "No reason provided", inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
    */

  } catch (err) {
    logger.error("Error executing unmute command:", err as Record<string, unknown>);

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