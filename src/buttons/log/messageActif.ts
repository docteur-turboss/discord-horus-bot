import {
  ButtonInteraction,
} from "discord.js";
import { handleLogToggle } from "utils/discord/logToggleHandler";

export const data = { name: "embeds.logs.message.actif" };

export const main = (interaction: ButtonInteraction) =>
  handleLogToggle(interaction, "message", true);