import { REST, Routes } from "discord.js";
import { commands } from "commands";
import { env } from "config/env";
import { logger } from "utils/logger/logger";

const { CLIENT_ID, BOT_TOKEN } = env;

// Construct and prepare an instance of the REST module
const commandData = commands.getCommandsData();

// and deploy your commands!
(async () => {
  const rest = new REST().setToken(BOT_TOKEN);

	try {
		logger.info(`Started refreshing ${commandData.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandData });

		logger.info(`Successfully reloaded ${commandData.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		logger.error("Error deploying commands:", error as Record<string, unknown>);
	}
})();