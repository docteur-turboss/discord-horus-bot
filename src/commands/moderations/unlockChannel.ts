import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock a text channel (allow sending messages)")
  .setDescriptionLocalizations({
      fr: "Déverrouille un channel textuel (autorise l'envoi de messages)",
  })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
    try {
        BaseCommand(interaction, "unlock-channel");
    } catch (err) {
        catchErrorInCommand(err, interaction, "unlock");
    }
};
