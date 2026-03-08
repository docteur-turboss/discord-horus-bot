import fs from "fs";
import path from "path";
import { Client } from "discord.js";
import { logger } from "utils/logger/logger";

class Events {
  static loadEvents(client: Client) {
    const eventFiles = fs
      .readdirSync(path.join(__dirname))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const event = require(path.join(__dirname, file));
      if(!event.data || !event.main) {
        logger.warn(`Event ${file} is missing data or main export.`);
        continue;
      }

      if(event.data && event.main) {
        if(event.data.once) {
          client.once(event.data.event, event.main);
        } else {
          client.on(event.data.event, event.main);
        }
      }
    }
  }
}

export const event = Events;