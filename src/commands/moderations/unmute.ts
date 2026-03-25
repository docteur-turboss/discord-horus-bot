import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
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
)
.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "unmute");
  } catch (err) { catchErrorInCommand(err, interaction, "unmute") }
};