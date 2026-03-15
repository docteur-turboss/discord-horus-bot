import { APIEmbedField, EmbedBuilder } from "discord.js";

export const errorEmbed = ({description = "", fields = []}: {fields?: APIEmbedField[], description?: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#ED4245") // Red Discord
    .setTitle("❌ Error")
    .setDescription(description)
    .setFooter({ text: "Made with ❤️ by Horus" });
};