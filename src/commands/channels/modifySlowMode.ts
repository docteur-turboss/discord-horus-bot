
import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
  .setName("modify-slow-mode")
  .setDescription("Modify the slowmode of a text channel")
  .setDescriptionLocalizations({
    fr: "Modifie le mode lent d'un salon textuel",
  })
  .addIntegerOption(option =>
    option
      .setName("duration")
      .setDescription("New duration of the slowmode in seconds")
      .setDescriptionLocalizations({
        fr: "Nouvelle durée du mode lent en secondes"
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
        BaseCommand(interaction, "modify-slow-mode");
    } catch (err) {
        catchErrorInCommand(err, interaction, "modify-slow-mode");
    }
};
