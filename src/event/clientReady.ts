import { Client, Events } from "discord.js";
import { logger } from "utils/logger/logger";

export const data = {
  event: Events.ClientReady,
  once: true,
}

export const main = async (client: Client ) => {
  logger.info(`Bot ready! Logged in as ${client.user?.tag}`);
}