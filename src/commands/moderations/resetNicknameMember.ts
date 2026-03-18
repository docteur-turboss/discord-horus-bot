import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
.setName("reset-member-nickname")
.setNameLocalizations({
  fr: "reset-pseudo",
})
.setDescription("Reset a member nickname.")
.setDescriptionLocalizations({
  fr: "Réinitialiser le pseudo d'un membre.",
})
.addUserOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to reset nickname")
  .setDescriptionLocalizations({
    fr: "Utilisateur dont le pseudo sera réinitialisé",
  })
  .setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "reset-member-nickname");

  } catch (err) { catchErrorInCommand(err, interaction, "reset-member-nickname") }
};