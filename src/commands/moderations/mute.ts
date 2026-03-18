import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

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
  .setMinValue(1)
  .setMaxValue(40321)
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
)
.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "mute");
    
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
  } catch (err) { catchErrorInCommand(err, interaction, "mute") }
};