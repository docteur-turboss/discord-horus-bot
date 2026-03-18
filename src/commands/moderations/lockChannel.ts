
import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
  .setName("lock")
  .setDescription("Lock a text channel (prevents sending messages)")
  .setDescriptionLocalizations({
    fr: "Verrouille un channel textuel (empêche d'envoyer des messages)",
  })
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setNameLocalizations({
        fr: "salon",
      })
      .setDescription("Channel to lock")
      .setDescriptionLocalizations({
        fr: "Salon à lock",
      })
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
    try {
        BaseCommand(interaction, "lock-channel");
    } catch (err) {
        catchErrorInCommand(err, interaction, "lock");
    }
};