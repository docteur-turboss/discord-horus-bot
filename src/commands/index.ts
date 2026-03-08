import fs from "fs";
import path from "path";
import { logger } from "utils/logger/logger";
import { Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

class Commands {
  private commands: Collection<string, any>;
  private cooldowns: Collection<string, Collection<string, number>>;
  private commandsData: RESTPostAPIChatInputApplicationCommandsJSONBody[];

  constructor() {
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.commandsData = [];

    this.loadCommands();
  }

  loadCommands() {
    if(!this.commands) this.commands = new Collection();
    const commandFolders = fs.readdirSync(path.join(__dirname));
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(path.join(__dirname, folder))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(path.join(__dirname, folder, file));

        if(!command.data || !command.main) {
          logger.warn(`Command ${file} is missing data or main export.`);
          continue;
        } 

        this.commands.set(command.data.name, command);
        this.commandsData.push(command.data.toJSON());
      }
    }
  }

  getCommand(commandName: string) {
    return this.commands.get(commandName);
  }

  getCommands() {
    return this.commands;
  }

  getCommandsData () {
    return this.commandsData;
  }

  ManageCooldowns (commandName: string): {
    timestamps: Collection<string, number>;
    cooldownAmount: number;
  } {
    if(!this.cooldowns.has(commandName)) this.cooldowns.set(commandName, new Collection());
    const command = this.commands.get(commandName);

    const timestamps = this.cooldowns.get(commandName)!;
    const defaultCooldownDuration = 1;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

    return { timestamps, cooldownAmount };
  }
}

export const commands = new Commands();