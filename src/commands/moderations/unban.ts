import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
.setName("unban")
.setNameLocalizations({
  fr: "debannir",
})
.setDescription("Unban a member from the server.")
.setDescriptionLocalizations({
  fr: "Débannir un membre du serveur.",
})
.addStringOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User ID to unban")
  .setDescriptionLocalizations({
    fr: "ID de l'utilisateur à débannir",
  })
  .setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "unban");
    
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
  } catch (err) { catchErrorInCommand(err, interaction, "unban") }
};