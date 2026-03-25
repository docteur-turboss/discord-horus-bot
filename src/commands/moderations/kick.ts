import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
.setName("kick")
.setNameLocalizations({
  fr: "expulser",
})
.setDescription("Kick a member from the server.")
.setDescriptionLocalizations({
  fr: "Expulser un membre du serveur.",
})
.addUserOption((option) =>
  option  
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to kick")
  .setDescriptionLocalizations({
    fr: "Utilisateur à expulser",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
    .setName("reason")
    .setNameLocalizations({
      fr: "raison",
    })
    .setDescription("Reason for the kick")
    .setDescriptionLocalizations({
      fr: "Raison de l'expulsion",
    })
    .setRequired(false)
)
.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "kick");
  } catch (err) { catchErrorInCommand(err, interaction, "kick") }
};