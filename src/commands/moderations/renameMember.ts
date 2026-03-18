import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
.setName("rename-member")
.setNameLocalizations({
  fr: "renommer",
})
.setDescription("Rename a member nickname.")
.setDescriptionLocalizations({
  fr: "Renommer le pseudo d'un membre.",
})
.addUserOption((option) =>
  option
  .setName("user")
  .setNameLocalizations({
    fr: "utilisateur",
  })
  .setDescription("User to rename")
  .setDescriptionLocalizations({
    fr: "Utilisateur à renommer",
  })
  .setRequired(true)
)
.addStringOption((option) =>
  option
  .setName("nickname")
  .setNameLocalizations({
    fr: "pseudo",
  })
  .setDescription("New nickname")
  .setDescriptionLocalizations({
    fr: "Nouveau pseudo",
  })
  .setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    BaseCommand(interaction, "rename-member")

  } catch (err) { catchErrorInCommand(err, interaction, "rename-member") }
};