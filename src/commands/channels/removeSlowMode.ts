
import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
  .setName("remove-slow-mode")
  .setDescription("Remove the slowmode from a text channel")
  .setDescriptionLocalizations({
    fr: "Supprime le mode lent d'un salon textuel",
  })
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
        BaseCommand(interaction, "remove-slow-mode");
    } catch (err) {
        catchErrorInCommand(err, interaction, "remove-slow-mode");
    }
};
