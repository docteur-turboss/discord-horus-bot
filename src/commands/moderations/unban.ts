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
  } catch (err) { catchErrorInCommand(err, interaction, "unban") }
};