import { ButtonInteraction, Events } from "discord.js";
import { followUp, reply } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { buttonsCommands } from "buttons";

export const data = {
  event: Events.InteractionCreate,
}

export const main = async (interaction: ButtonInteraction) => {
	if (!interaction.isButton()) return;
	if(interaction.customId === "confirm_action" || interaction.customId === "cancel_action") return;
	const command = buttonsCommands.getButton(interaction.customId);

	if (!command) {
		logger.error(`No command matching ${interaction.id} was found.`);
		return await reply(interaction, { 
			key: "errors.no_command_found", 
			ephemeral: true,
			type: "error",
		});
	}

	try {
		await command.main(interaction);
	} catch (error) {
		logger.error("Error executing button " + interaction.id, error as Record<string, unknown>);

		if (interaction.replied || interaction.deferred) return await followUp(interaction, {
			key: "errors.command_execution",
			type: "error",
			ephemeral: true
		})
			
    await reply(interaction, {
			key: "errors.command_execution",
			ephemeral: true,
			type: "error",
		});
  }
};