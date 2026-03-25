import {
  ButtonInteraction,
} from "discord.js";
import { handleLogToggle } from "utils/discord/logToggleHandler";

export const data = { name: "embeds.logs.message.inactif" };

export const main = (interaction: ButtonInteraction) =>
  handleLogToggle(interaction, "message", false);