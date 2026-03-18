import { APIEmbedField, EmbedBuilder } from "discord.js";
import { t } from "utils/locales/i18n";

export const infoEmbed = ({description = "", fields = [], lang="en"}: {fields?: APIEmbedField[], description?: string, lang: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#5865F2") // Bleu Discord
    .setTitle(t(lang, "embeds.info"))
    .setDescription(description)
    .setFooter({ text: t(lang, "embeds.footer") });
};