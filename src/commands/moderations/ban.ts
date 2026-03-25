import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getLogModerationChannel } from "utils/discord/getLogModerationChannel";
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
  } catch (err) { catchErrorInCommand(err, interaction, "ban") }
}