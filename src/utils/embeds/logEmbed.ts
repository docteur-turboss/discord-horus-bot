import { TranslationKey } from "utils/locales/i18n.types";
import { APIEmbedField, EmbedBuilder } from "discord.js";
import { t } from "utils/locales/i18n";

type logType = 
  | "transcriptions"
  | "candidatures"
  | "moderation"
  | "channels"
  | "message"
  | "tickets"
  | "roles";
  
const LOG_TYPE_TRANSLATION_KEY: Record<logType, TranslationKey> = {
  roles: "embeds.logs.roles",
  message: "embeds.logs.message",
  tickets: "embeds.logs.tickets",
  channels: "embeds.logs.channels",
  moderation: "embeds.logs.moderation",
  candidatures: "embeds.logs.candidatures",
  transcriptions: "embeds.logs.transcriptions",
};

export const translateTitle = ({
  lang,
  type,
}: {
  lang: string;
  type: logType;
}) => {
  return t(lang, LOG_TYPE_TRANSLATION_KEY[type]);
};

export const logEmbed = ({description = "", fields = [], lang="en", type}: {fields?: APIEmbedField[], description?: string, lang: string, type: logType }) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#5865F2") // Bleu Discord
    .setTitle(translateTitle({lang, type}))
    .setDescription(description)
    .setFooter({ text: t(lang, "embeds.footer") });
};