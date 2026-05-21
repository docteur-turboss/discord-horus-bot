
import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
  .setName("set-slow-mode")
  .setDescription("Set a slowmode for a text channel")
  .setDescriptionLocalizations({
    fr: "Définit un mode lent pour un salon textuel",
  })
  .addIntegerOption(option =>
    option
      .setName("duration")
      .setDescription("Duration of the slowmode in seconds")
      .setDescriptionLocalizations({
        fr: "Durée du mode lent en secondes"
      })
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setNameLocalizations({
        fr: "salon",
      })
      .setDescription("Channel to target")
      .setDescriptionLocalizations({
        fr: "Salon à cibler",
      })
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
    try {
        BaseCommand(interaction, "set-slow-mode");
    } catch (err) {
        catchErrorInCommand(err, interaction, "set-slow-mode");
    }
};
