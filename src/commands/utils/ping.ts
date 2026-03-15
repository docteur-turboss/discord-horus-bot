import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { logger } from "utils/logger/logger";

export const data = new SlashCommandBuilder()
.setName("ping")
.setDescription("Replies the bot ping.")
.setDescriptionLocalizations({
  fr: "Répond avec le ping du bot.",
});

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply("Pong !").catch((err) => {
    logger.error("Error replying to ping command:", err);
  });
  // Edit later
}