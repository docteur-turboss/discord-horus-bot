import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, GuildMember, EmbedBuilder } from "discord.js";
import { followUpError, replyError, replySuccess } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

export const data = new SlashCommandBuilder()
.setName("unban")
.setDescription("Unban a member from the server.")
.addStringOption((option) =>
  option
    .setName("user")
    .setDescription("User ID to unban")
    .setRequired(true)
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild) return await replyError(interaction, {
      key: "errors.guild_only",
      ephemeral: true
    });

    const userId = interaction.options.getString("user", true).trim();

    const member = interaction.member as GuildMember;
    const botMember = interaction.guild.members.me;

    // Validate user ID format (prevent injection / malformed input)
    const userIdRegex = /^[0-9]{17,20}$/;
    if (!userIdRegex.test(userId)) return await replyError(interaction, {
      key: "errors.invalid_user_id",
      ephemeral: true,
    });

    // Check user permission
    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) return await replyError(interaction, {
      key: "errors.no_permission_unban",
      ephemeral: true
    });

    // Check bot permission
    if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) return await replyError(interaction, {
      key: "errors.bot_no_permission_unban",
      ephemeral: true
    });

    // Fetch ban list
    const banList = await interaction.guild.bans.fetch();
    const bannedUser = banList.get(userId);

    if (!bannedUser) return await replyError(interaction, {
      key: "errors.user_not_banned",
      ephemeral: true,
    });

    await interaction.guild.members.unban(userId);

    await replySuccess(interaction, {
      key: "moderation.unban_success",
      vars: {
        user: `${bannedUser.user.tag}`
      }
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
        .setTitle("🔓 Member Unbanned")
        .addFields(
          { name: "User", value: `${bannedUser.user.tag} (${bannedUser.user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }
    */

  } catch (err) {

    logger.error("Error executing unban command:", err as Record<string, unknown>);

    if (!interaction.replied) return await replyError(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
    });

    return await followUpError(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
    });

  }
};