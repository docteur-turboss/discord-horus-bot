import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, GuildMember, EmbedBuilder } from "discord.js";
import { followUpError, replyError, replySuccess } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban a member from the server.")
.addUserOption((option) =>
  option
    .setName("user")
    .setDescription("User to ban")
    .setRequired(true)
)
.addStringOption((option) =>
  option
    .setName("reason")
    .setDescription("Reason for the ban")
    .setRequired(false)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {


  try {
    if (!interaction.guild) return await replyError(interaction, {
      key: "errors.guild_only",
      ephemeral: true
    });

    const targetUser = interaction.options.getUser("user", true);
    const reason =
      interaction.options.getString("reason") || t(interaction, "moderation.no_reason");

    const member = interaction.member as GuildMember;
    const targetMember = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    const botMember = interaction.guild.members.me;

    // Check user permission
    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) return await replyError(interaction, {
      key: "errors.no_permission_ban",
      ephemeral: true
    })

    // Check bot permission
    if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) return await replyError(interaction, {
      key: "errors.bot_no_permission_ban",
      ephemeral: true
    })
      
    // Prevent self ban
    if (targetUser.id === interaction.user.id) return await replyError(interaction, {
      key: "errors.self_ban",
      ephemeral: true,
    })
      
    // Prevent banning server owner
    if (targetUser.id === interaction.guild.ownerId) return await replyError(interaction, {
      key: "errors.owner_ban",
      ephemeral: true,
    })
      
    // Check if member exists in guild
    if (!targetMember) return await replyError(interaction, {
      key: "errors.user_not_found",
      ephemeral: true,
    })
      
    // Check bannable
    if (!targetMember.bannable) return await replyError(interaction, {
      key: "errors.not_bannable",
      ephemeral: true,
    })
      
    await targetMember.ban({ reason });

    await replySuccess(interaction, {
      key: "moderation.ban_success",
    })

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

    if (!interaction.replied) return await replyError(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
    })
      
    return await followUpError(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
    })
  }
}