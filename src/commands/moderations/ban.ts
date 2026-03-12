import { 
  ChatInputCommandInteraction, 
  InteractionCallbackResponse,
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ActionRowBuilder,
  ComponentType, 
  ButtonBuilder, 
  ButtonStyle, 
  GuildMember,
} from "discord.js";
import { checkPermissions } from "utils/validation/checkPermissions";
import { reply, editReply, followUp } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { createConfirmationButtons } from "utils/buttons/confirmationBtn";

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
    if (!interaction.guild) return await reply(interaction, {
      key: "errors.guild_only",
      ephemeral: true,
      type: "error"
    });

    const targetUser = interaction.options.getUser("user", true);
    const reason =
      interaction.options.getString("reason") || t(interaction, "moderation.no_reason");

    const member = interaction.member as GuildMember;
    const targetMember = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    const botMember = interaction.guild.members.me;

    const perms = checkPermissions(member, botMember!);
    
    // Check user permission
    if (!perms.canBan) return await reply(interaction, {
      key: "errors.no_permission_ban",
      ephemeral: true,
      type: "error"
    })

    // Check bot permission
    if (!perms.botCanBan) return await reply(interaction, {
      key: "errors.bot_no_permission_ban",
      ephemeral: true,
      type: "error"
    })
      
    // Prevent self ban
    if (targetUser.id === interaction.user.id) return await reply(interaction, {
      key: "errors.self_ban",
      ephemeral: true,
      type: "error"
    })
      
    // Prevent banning server owner
    if (targetUser.id === interaction.guild.ownerId) return await reply(interaction, {
      key: "errors.owner_ban",
      ephemeral: true,
      type: "error"
    })
      
    // Check if member exists in guild
    if (!targetMember) return await reply(interaction, {
      key: "errors.user_not_found",
      ephemeral: true,
      type: "error"
    })
      
    // Check bannable
    if (!targetMember.bannable) return await reply(interaction, {
      key: "errors.not_bannable",
      ephemeral: true,
      type: "error"
    })
      
    const confirmRow = createConfirmationButtons(interaction);
    const confirmation = await reply(interaction, {
      key: "moderation.ban_confirm",
      vars: { user: targetUser.tag },
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

      if (i.customId === "cancel_ban") return await editReply(i, {
        key: "moderation.action_cancelled",
        components: [],
        type: "info"
      });

      if (i.customId === "confirm_ban") {
        await targetMember.ban({ reason });
        collector.stop();

        await editReply(interaction, {
          key: "moderation.ban_success",
          components: [],
          vars: {
            user: targetUser.tag,
            reason
          }
        });
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") await editReply(interaction, {
          key: "moderation.action_cancelled",
          components: [],
          type: "info"
        });
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