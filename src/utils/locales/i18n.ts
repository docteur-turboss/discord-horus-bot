import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";

/* eslint-disable-next-line */
const translations: Record<string, any> = {
  en,
  fr,
};

export const t = (
  interaction: ChatInputCommandInteraction | ButtonInteraction | string | undefined,
  key: string,
  vars?: Record<string, string>
) => {
  const locale = typeof interaction === "string"
    ? interaction
    : interaction?.locale?.split("-")[0] ?? "en";

  let text =
    translations[locale]?.[key] ??
    translations["en"]?.[key] ??
    key;

  if (vars) {
    for (const v in vars) {
      text = text.replace(`{${v}}`, vars[v]);
    }
  }

  return text;
}