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
.setName("kick")
.setNameLocalizations({
  fr: "expulser",
})
.setDescription("Kick a member from the server.")
.setDescriptionLocalizations({
  fr: "Expulser un membre du serveur.",
})
.addUserOption((option) =>
  option  
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to kick")
  .setDescriptionLocalizations({
    fr: "Utilisateur à expulser",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
    .setName("reason")
    .setNameLocalizations({
      fr: "raison",
    })
    .setDescription("Reason for the kick")
    .setDescriptionLocalizations({
      fr: "Raison de l'expulsion",
    })
    .setRequired(false)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!(await ensureGuildInteraction(interaction))) return;
    if (!(await validateModerationPermissions(interaction, "KickMembers"))) return;

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

    if (!targetMember.kickable)
      return await reply(interaction, {
        key: "errors.not_kickable",
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
      confirmKey: "moderation.kick_confirm",
      successKey: "moderation.kick_success",
      vars,

      onConfirm: async () => {
        await targetSend(targetMember, interaction, {
          key: "moderation.kick_dm",
          vars,
          type: "info",
        }).catch(() => null);

        await targetMember.kick(reason);
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
        .setColor(0xFEE75C)
        .setTitle("👢 Member Kicked")
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
    logger.error("Error executing kick command:", err as Record<string, unknown>);

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