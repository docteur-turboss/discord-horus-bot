import { validateModerationPermissions } from "utils/moderations/validateModerationPermissions";
import { validateModerationTarget } from "utils/moderations/validateModerationTarget";
import { validateRoleHierarchy } from "utils/moderations/validateRoleHierarchy";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ensureGuildInteraction } from "utils/discord/ensureGuildInteraction";
import { reply, followUp, targetSend } from "utils/discord/reply";
import { isUserBanned } from "utils/moderations/getBannedUser";
import { getMemberSafe } from "utils/discord/getMemberSafe";
import { confirmAction } from "utils/discord/confirmAction";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = new SlashCommandBuilder()
.setName("ban")
.setNameLocalizations({
  fr: "bannir",
})
.setDescription("Ban a member from the server.")
.setDescriptionLocalizations({
  fr: "Bannir un membre du serveur.",
})
.addUserOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to ban")
  .setDescriptionLocalizations({
    fr: "Utilisateur à bannir",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
  .setName("reason")
  .setNameLocalizations({
    fr: "raison",
  })
  .setDescription("Reason for the ban")
  .setDescriptionLocalizations({
    fr: "Raison du bannissement",
  })
  .setRequired(false)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if(!(await ensureGuildInteraction(interaction))) return;
    if(!(await validateModerationPermissions(interaction, "BanMembers"))) return;

    const targetUser = interaction.options.getUser("user", true);
    const reason =
      interaction.options.getString("reason") || t(interaction, "moderation.no_reason");
    
    if(!(await validateModerationTarget(interaction, targetUser.id))) return;

    const targetMember = await getMemberSafe(interaction.guild!, targetUser.id);      
    if (!targetMember) return await reply(interaction, {
      key: "errors.user_not_found",
      ephemeral: true,
      type: "error"
    })
      
    if(!(await validateRoleHierarchy(interaction, targetMember))) return;
    if (!targetMember.bannable) return await reply(interaction, {
      key: "errors.not_bannable",
      ephemeral: true,
      type: "error"
    })
      
    const vars = {
      guild: interaction.guild!.name,
      reason,
      user: targetUser.tag,
      moderator: interaction.user.tag
    };

    await confirmAction(interaction, {
      confirmKey: "moderation.ban_confirm",
      successKey: "moderation.ban_success",
      vars,

      onConfirm: async () => {
        if (await isUserBanned(interaction.guild!, targetUser.id)) {
          throw reply(interaction, {
            key: "errors.already_banned",
            ephemeral: true,
            type: "error"
          });
        }

        await targetSend(targetMember, interaction, ({
          key: "moderation.ban_dm",
          vars,
          type: "info"
        })).catch(() => null);

        await targetMember.ban({ reason });
      },
    });

    /*
    ========================================
    FUTURE MODERATION LOG SYSTEM
    ========================================

    // Example: get log channel ID from config
    const logChannelId = "LOG_CHANNEL_ID";

    // Fetch the log channel
    const logChannel = interaction.guild?.channels.cache.get(logChannelId);

    // If the channel exists and is text based
    if (logChannel && logChannel.isTextBased()) {

      const logEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("🔨 Member Banned")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason || "No reason provided", inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }

    Possible improvements later:
    - Send logs to a configurable channel
    - Save moderation actions in a database
    - Add case IDs (case #001, #002...)
    - Log unban / kick / timeout actions
    - Include user avatar & moderator avatar
    - Include previous infractions
    */
  } catch (err) {
    logger.error("Error executing ban command:", err as Record<string, unknown>);

    if (!interaction.replied) return await reply(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
      type: "error",
    })
      
    return await followUp(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
      type: "error",
    })
  }
}