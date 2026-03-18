import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

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
    BaseCommand(interaction, "unmute");

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
  } catch (err) { catchErrorInCommand(err, interaction, "unmute") }
};