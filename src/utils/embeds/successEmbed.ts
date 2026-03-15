import { APIEmbedField, EmbedBuilder } from "discord.js";

export const successEmbed = ({description = "", fields = []}: {fields?: APIEmbedField[], description?: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#57F287") // Vert Discord
    .setTitle("✅ Success")
    .setDescription(description)
    .setFooter({ text: "Made with ❤️ by Horus" });
};