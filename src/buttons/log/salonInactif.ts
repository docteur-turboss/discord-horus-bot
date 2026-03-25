import {
  ButtonInteraction,
} from "discord.js";
import { handleLogToggle } from "utils/discord/logToggleHandler";

export const data = { name: "embeds.logs.channels.inactif" };

export const main = (interaction: ButtonInteraction) =>
  handleLogToggle(interaction, "channel", false);