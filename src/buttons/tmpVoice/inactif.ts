import { ButtonInteraction } from "discord.js";
import { handleTmpVoiceToggle } from "utils/discord/logToggleHandler";

export const data = { name: "embeds.logs.tmp_voice.inactif" };

export const main = (interaction: ButtonInteraction) =>
  handleTmpVoiceToggle(interaction, false);
