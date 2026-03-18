import en from "../../locales/en";
import fr from "../../locales/fr";
import { TranslationKey, Translations, VarsFor } from "./i18n.types";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";

const translations: Record<string, Record<string, string>> = {
  en,
  fr,
};

export const t = <
  K extends TranslationKey
>(
  interaction: ChatInputCommandInteraction | ButtonInteraction | string | undefined,
  key: K,
  vars?: VarsFor<K>
) => {
  const locale = typeof interaction === "string"
    ? interaction
    : interaction?.locale?.split("-")[0] ?? "en";

  let text =
    translations[locale]?.[key] ??
    translations["en"]?.[key] ??
    key;

  if (vars) {
    for (const [key, value] of Object.entries(vars) as [keyof typeof vars, string][]) {
      text = text.replace(`{${String(key)}}`, value);
    }
  }

  return text;
};