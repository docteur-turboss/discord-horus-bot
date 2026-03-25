import { logger } from "utils/logger/logger";
import { Collection } from "discord.js";
import fs, { lstatSync } from "fs";
import path from "path";

class ButtonsCommands {
  /* eslint-disable-next-line */
  private buttons: Collection<string, any>;

  constructor() {
    this.buttons = new Collection();

    this.loadCommands();
  }

  loadCommands() {
    if(!this.buttons) this.buttons = new Collection();
    const buttonsFolders = fs.readdirSync(path.join(__dirname));
    for (const folder of buttonsFolders) {
      if(!lstatSync(path.join(__dirname, folder)).isDirectory()) continue;

      const buttonsFiles = fs
        .readdirSync(path.join(__dirname, folder))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      for (const file of buttonsFiles) {
      /* eslint-disable-next-line */
        const buttons = require(path.join(__dirname, folder, file));

        if(!buttons.data || !buttons.main) {
          logger.warn(`Buttons ${file} is missing data or main export.`);
          continue;
        } 

        this.buttons.set(buttons.data.name, buttons);
      }
    }
  }

  getButton(buttonName: string) {
    return this.buttons.get(buttonName);
  }

  getButtons() {
    return this.buttons;
  }
}

export const buttonsCommands = new ButtonsCommands();