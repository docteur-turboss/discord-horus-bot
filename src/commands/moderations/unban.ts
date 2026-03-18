import { validateModerationPermissions } from "utils/moderations/validateModerationPermissions";
import { validateUserIdOrReply } from "utils/validation/validateUserIdOrReply";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ensureGuildInteraction } from "utils/discord/ensureGuildInteraction";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { getBannedUserOrReply } from "utils/moderations/getBannedUser";
import { confirmAction } from "utils/discord/confirmAction";

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
);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    if(!(await ensureGuildInteraction(interaction))) return;

    const userId = interaction.options.getString("user", true).trim();

    if(!(await validateModerationPermissions(interaction, "BanMembers"))) return;
    if(!(await validateUserIdOrReply(interaction, userId))) return;

    const bannedUser = await getBannedUserOrReply(interaction, userId);
    if(!bannedUser) return;

    await confirmAction(interaction, {
      confirmKey: "moderation.unban_confirm",
      successKey: "moderation.unban_success",
      vars: { user: bannedUser.user.tag },

      onConfirm: async () => {
        await interaction.guild!.members.unban(userId);
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