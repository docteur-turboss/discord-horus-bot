import { commands } from "commands";
import { ChatInputCommandInteraction, Collection, Events, MessageFlags } from "discord.js";
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
		return;
	}

	if (timestamps.has(interaction.user.id)) {	
		const expirationTime = timestamps.get(interaction.user.id)??0 + cooldownAmount;
		if (Date.now() < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1_000);
			return interaction.reply({
				content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
				flags: MessageFlags.Ephemeral,
			});
		}
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.error("Error executing command " + interaction.commandName, error as Record<string, unknown>);

		if (interaction.replied || interaction.deferred) return await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
    
    await interaction.reply({
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral,
    });
  }
};