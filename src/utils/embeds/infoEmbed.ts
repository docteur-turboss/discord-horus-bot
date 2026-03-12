import { APIEmbedField, EmbedBuilder } from "discord.js";

export const infoEmbed = ({description = "", fields = []}: {fields?: APIEmbedField[], description?: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#5865F2") // Bleu Discord
    .setTitle("ℹ️ Information")
    .setDescription(description)
    .setFooter({ text: "Made with ❤️ by Horus" });
};