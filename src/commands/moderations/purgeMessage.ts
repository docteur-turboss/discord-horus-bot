import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { BaseCommand } from "utils/commands/baseCommand";

export const data = new SlashCommandBuilder()
.setName("purge-message")
.setNameLocalizations({
  fr: "purger-message",
})
.setDescription("Delete a number of messages from a channel.")
.setDescriptionLocalizations({
  fr: "Supprime un nombre de messages d'un canal.",
})
.addIntegerOption((option) =>
  option
    .setName("amount")
    .setNameLocalizations({
      fr: "nombre",
    })
    .setDescription("Number of messages to delete (1-100)")
    .setDescriptionLocalizations({
      fr: "Nombre de messages à supprimer (1-100)",
    })
    .setMinValue(1)
    .setMaxValue(100)
    .setRequired(true)
)
.addChannelOption((option) =>
  option
    .setName("channel")
    .setNameLocalizations({
      fr: "salon",
    })
    .setDescription("Channel to purge messages from")
    .setDescriptionLocalizations({
      fr: "Salon depuis lequel supprimer les messages",
    })
    .setRequired(false)
)
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    await BaseCommand(interaction, "purge-message");
  } catch (err) {
    catchErrorInCommand(err, interaction, "purge-message");
  }
};