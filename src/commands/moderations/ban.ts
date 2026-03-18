import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

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
)
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "ban");
    
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
  } catch (err) { catchErrorInCommand(err, interaction, "ban") }
}