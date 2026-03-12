import { commands } from "commands";
import { ChatInputCommandInteraction, Events, MessageFlags } from "discord.js";
import { followUpError, replyError } from "utils/discord/reply";
import { logger } from "utils/logger/logger";

export const data = {
  event: Events.InteractionCreate,
}

export const main = async (interaction: ChatInputCommandInteraction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = commands.getCommand(interaction.commandName);
	const { timestamps, cooldownAmount} = commands.ManageCooldowns(interaction.commandName);

	if (!command) {
		logger.error(`No command matching ${interaction.commandName} was found.`);
		return await replyError(interaction, { 
			key: "errors.no_command_found", 
			ephemeral: true
		});
	}

	if (timestamps.has(interaction.user.id)) {	
		const expirationTime = timestamps.get(interaction.user.id)??0 + cooldownAmount;
		if (Date.now() < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1_000);
			return await replyError(interaction, {
				key: "cooldown.active",
				ephemeral: true,
				vars: {
					command: command.data.name,
					time: `<t:${expiredTimestamp}:R>`
				}
			})
		}
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.error("Error executing command " + interaction.commandName, error as Record<string, unknown>);

		if (interaction.replied || interaction.deferred) return await followUpError(interaction, {
			key: "errors.command_execution",
			ephemeral: true
		})
			
    await replyError(interaction, {
			key: "errors.command_execution",
			ephemeral: true
		});
  }
};