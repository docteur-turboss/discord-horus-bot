import { 
  ChatInputCommandInteraction, 
  InteractionCallbackResponse, 
  SlashCommandBuilder, 
  ComponentType,
  GuildMember,
} from "discord.js";
import { createConfirmationButtons } from "utils/buttons/confirmationBtn";
import { checkPermissions } from "utils/validation/checkPermissions";
import { editReply, followUp, reply } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { validateUserId } from "utils/validation/validUserId";

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
    if (!interaction.guild) return await reply(interaction, {
      key: "errors.guild_only",
      ephemeral: true,
      type: "error",
    });

    const userId = interaction.options.getString("user", true).trim();
    const member = interaction.member as GuildMember;
    const botMember = interaction.guild.members.me;

    const perms = checkPermissions(member, botMember!);

    // Validate user ID format (prevent injection / malformed input)
    if (!validateUserId(userId)) return await reply(interaction, {
      key: "errors.invalid_user_id",
      ephemeral: true,
      type: "error",
    });

    // Check user permission
    if (!perms.canBan) return await reply(interaction, {
      key: "errors.no_permission_unban",
      ephemeral: true,
      type: "error",
    });

    // Check bot permission
    if (!perms.botCanBan) return await reply(interaction, {
      key: "errors.bot_no_permission_unban",
      ephemeral: true,
      type: "error",
    });

    // Fetch ban list
    const bannedUser = (await interaction.guild.bans.fetch()).get(userId);
    if (!bannedUser) return await reply(interaction, {
      key: "errors.user_not_banned",
      ephemeral: true,
      type: "error",
    });

    // Confirmation message
    const confirmRow = createConfirmationButtons(interaction);
    const confirmation = await reply(interaction, {
      key: "moderation.unban_confirm",
      vars: { user: bannedUser.user.tag },
      components: [confirmRow],
      type: "warning",
      ephemeral: true,
    }) as unknown as InteractionCallbackResponse<true>;

    const msg =
      "resource" in confirmation && confirmation.resource?.message
        ? confirmation.resource.message
        : null;

    if(!msg) return await editReply(interaction, {
      key: "errors.command_execution",
      type: "error",
      components: [],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15_000,
    });
    
    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) return await reply(i, {
        key: "errors.not_command_author",
        ephemeral: true,
        type: "error",
      })

      if (i.customId === "cancel_action") return await editReply(i, {
        key: "moderation.action_cancelled",
        components: [],
        type: "info"
      });

      if (i.customId === "confirm_action") {
        collector.stop();
        await interaction.guild!.members.unban(userId);
        return await editReply(interaction, {
          vars: {user: bannedUser.user.tag},
          key: "moderation.unban_success",
          components: [],
        });
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") await editReply(interaction, {
        key: "moderation.action_cancelled",
        components: [],
        type: "info"
      });
    })

    await reply(interaction, {
      key: "moderation.unban_success",
      vars: {
        user: `${bannedUser.user.tag}`
      },
      type: "success",
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

    if (!interaction.replied) return await reply(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
    });

    return await followUp(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
      type: "error"
    });

  }
};