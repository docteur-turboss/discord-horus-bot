import { APIEmbedField, EmbedBuilder } from "discord.js";

export const warningEmbed = ({description = "", fields = []}: {fields?: APIEmbedField[], description?: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#FEE75C") // Jaune Discord
    .setTitle("⚠️ Warning")
    .setDescription(description)
    .setFooter({ text: "Made with ❤️ by Horus" });
};